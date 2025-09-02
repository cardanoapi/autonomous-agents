import { TriggerType } from '../service/triggerService'
import { saveTxLog } from '../utils/agent'
import { globalState } from '../constants/global'
import { LLMService } from '../service/LLMService'
import { EventContext } from './BaseFunction'
import { AgentRunner } from './AgentRunner'

export class LLMGatedRunner {
    constructor(private readonly core: AgentRunner) {}

    async invokeFunction(triggerType: TriggerType, instanceIndex: number, method: string, ...args: any) {
        const extractedArgs = this.extractArgumentValues(args)
        const shouldGate = this.shouldUseLLMForFunction(method) && this.isCron(triggerType)
        if (shouldGate) {
            try {
                const llm = new LLMService()
                const decision = await llm.shouldExecuteFunction(
                    method,
                    extractedArgs,
                    {},
                    this.getUserPreferenceText(method),
                    this.getSystemPrompt()
                )
                if (!decision.should_execute) {
                    const blocked = [
                        {
                            function: method,
                            arguments: args,
                            return: {
                                operation: method,
                                executed: false,
                                blocked_by_llm: true,
                                llm_reasoning: decision.reasoning,
                                llm_confidence: decision.confidence,
                                message: `LLM blocked: ${decision.reasoning}`,
                                timestamp: new Date().toISOString(),
                            },
                        },
                    ]
                    saveTxLog(blocked, (this.core as any).managerInterface, triggerType, instanceIndex)
                    return
                }
            } catch (e) {
                console.error(`LLM gating failed, continuing: ${e}`)
            }
        }
        return this.core.invokeFunction(triggerType, instanceIndex, method, ...args)
    }

    async invokeFunctionWithEventContext(
        eventFilterContext: any,
        context: EventContext,
        triggerType: TriggerType,
        instanceIndex: number,
        method: string,
        parameters: any[]
    ) {
        return this.core.invokeFunctionWithEventContext(
            eventFilterContext,
            context,
            triggerType,
            instanceIndex,
            method,
            parameters
        )
    }

    async remakeContext(index: number) {
        return this.core.remakeContext(index)
    }

    // helpers
    private isCron(triggerType: TriggerType): boolean {
        return String(triggerType) === 'CRON'
    }
    private shouldUseLLMForFunction(method: string): boolean {
        const fnCfg = globalState.functionLLMSettings?.[method]
        return !!(fnCfg && fnCfg.enabled)
    }
    private getUserPreferenceText(method: string): string {
        return globalState.functionLLMSettings?.[method]?.userPrefText || ''
    }
    private getSystemPrompt(): string {
        return (globalState.systemPrompt ?? '').toString()
    }
    private extractArgumentValues(args: any[]) {
        return args.map((a) => (a && typeof a === 'object' && 'value' in a ? a.value : a))
    }
}
