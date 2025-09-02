import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

export class LLMService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('No Gemini API key')
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
      console.log('LLM not configured')
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

      console.log('Asking LLM...')

      const response: any = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      console.log('Response from Gemini:', response.text)

      const decision = this.extractJson(response.text)
      console.log('After parsing:', decision)

      return {
        should_execute: decision.should_execute,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
      }
    } catch (error: any) {
      console.error('LLM failed, error:', error)
      return {
        should_execute: true,
        confidence: 0.6,
        reasoning: `LLM service failed: ${error.message}`,
      }
    }
  }

  private buildPrompt(
    functionName: string,
    functionArgs: any[],
    structuredPreferences: any,
    userPreferenceText: any,
    systemPrompt: string
  ): string {
    const baseSystemP = systemPrompt || 'You are a Cardano autonomous agent'
    console.log('System prompt check:', systemPrompt)

    const context =
      structuredPreferences && Object.keys(structuredPreferences).length
        ? `\nContext:\n${JSON.stringify(structuredPreferences, null, 2)} `
        : ''

    const userPolicy = userPreferenceText
      ? `\nUser Policy:\n${userPreferenceText}`
      : ''

    console.log('User policy:', userPolicy)
    console.log('Context:', context)

    return `
${baseSystemP}

FUNCTION TO EXECUTE: ${functionName}
Args: ${JSON.stringify(functionArgs)}${context}${userPolicy}

Analyze this call strictly against "User Policy" and System prompt.
Return ONLY JSON:
{"should_execute": true/false, "confidence": 0.0-1.0, "reasoning": "brief"}
`
  }

  extractJson(text: string): any {
    const cleaned = text.replace(/```json|```/g, '').trim()

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
