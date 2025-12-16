import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { globalState } from '../constants/global'
import { LLMService } from '../service/LLMService'

export type SamplingDecision = { execute: boolean; reason: string }
export type SamplingGate = (toolname: string, args: Record<string, unknown>) => Promise<SamplingDecision>

function extractParamsForLLM(args: Record<string, unknown>) {
    const parameters = (args as any)?.parameters
    // normalize array of { name, value } | any[] | object
    if (Array.isArray(parameters)) return parameters
    if (parameters && typeof parameters === 'object') return [{ ...parameters }]
    return [{ ...(args || {}) }]
}

async function fallbackWithLLM(
    toolName: string,
    args: Record<string, unknown>,
    sys: string
): Promise<SamplingDecision> {
    try {
        const llm = new LLMService()
        const decision = await llm.shouldExecuteFunction(toolName, extractParamsForLLM(args), {}, '', sys)
        return {
            execute: !!decision.should_execute,
            reason: decision.reasoning || 'fallback-llm',
        }
    } catch (e: any) {
        console.warn('Sampling fallback error:', e?.message)
        return { execute: true, reason: 'fallback-error' }
    }
}
export function createSamplingGate(server: McpServer) {
    return async function samplingGate(toolName: string, args: Record<string, unknown>): Promise<SamplingDecision> {
        const sys = (globalState.systemPrompt || '').trim()
        if (!sys) return { execute: true, reason: 'no system prompt' }
        const argPreview = JSON.stringify(args)
        const prompt = `System Prompt (policy):
${sys}

Tool: ${toolName}
Arguments JSON: ${argPreview}

Decide if executing this tool violates the system prompt / policy.
Return ONLY strict JSON:
{"execute": true|false, "reason": "very short explanation"}
Keep reason concise.`

        let response: any
        try {
            response = await server.server.createMessage({
                messages: [
                    {
                        role: 'user',
                        content: { type: 'text', text: prompt },
                    },
                ],
                maxTokens: 300,
            })
        } catch (e) {
            console.log('MCP { Sampling} sampling error , using LLM fallback')
            return await fallbackWithLLM(toolName, args, sys)
        }
        console.log('RESPONSE from sampling is', response)
        console.log('RESPONSE content from sampling is', response.content)
        const parsed = JSON.parse(response.content.text)
        console.log('RESPONSE AFTER PARSE ', parsed.reason)

        return { execute: parsed.execute, reason: parsed.reason }
    }
}
