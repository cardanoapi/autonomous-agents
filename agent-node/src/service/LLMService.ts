import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

export class LLMService {
    private apiKey: string

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || ''
        if (!this.apiKey) {
            console.warn('no gemini api key')
        }
    }

    async shouldExecuteFunction(
        functionName: string,
        functionArgs: any[],
        structuredPreferences: any,
        userPreferenceText: any,
        systemPrompt: string
    ): Promise<{
        should_execute: boolean
        confidence: number
        reasoning: string
    }> {
        if (!this.apiKey) {
            return {
                should_execute: true,
                confidence: 0.5,
                reasoning: 'LLM not configured, default allow',
            }
        }

        try {
            const prompt = this.buildPrompt(
                functionName,
                functionArgs,
                structuredPreferences,
                userPreferenceText,
                systemPrompt
            )
            const response: any = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            })

            const decision = this.extractJson(response.text)
            return {
                should_execute: decision.should_execute,
                confidence: decision.confidence,
                reasoning: decision.reasoning,
            }
        } catch (error: any) {
            console.error('llm failed, the error is:', error)
            return {
                should_execute: true,
                confidence: 0.6,
                reasoning: `LLM service Failed: ${error.message}`,
            }
        }
    }
    private buildPrompt(
        functionName: string,
        functionArgs: any[],
        structuredPreferences: any,
        userPreferenceText: any,
        systemPrompt: string
    ) {
        const baseSystemP =
            systemPrompt || 'you are an cardano autonomous agent'
        const context =
            structuredPreferences && Object.keys(structuredPreferences).length
                ? `\nContext:\n${JSON.stringify(structuredPreferences, null, 2)} `
                : ''
        const userPolicy = userPreferenceText
            ? `\nUser Policy:\n${userPreferenceText}`
            : ''

        return ` ${baseSystemP}

FUNCTION TO EXECUTE: ${functionName}
Args: ${JSON.stringify(functionArgs)}${context}${userPolicy}

Analyze this call strictly against "User Policy".
Return ONLY JSON:
{"should_execute": true/false, "confidence": 0.0-1.0, "reasoning": "brief"}

`
    }

    extractJson(text: string): any {
        // Remove code block markers if present
        const cleaned = text.replace(/```json|```/g, '').trim()
        // Find the first { and last }
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
            const jsonString = cleaned.substring(start, end + 1)
            try {
                return JSON.parse(jsonString)
            } catch (e) {
                console.error('JSON parse error:', e, jsonString)
            }
        }
        return {
            should_execute: false,
            confidence: 0.0,
            reasoning: 'Failed to parse LLM response',
        }
    }
}
