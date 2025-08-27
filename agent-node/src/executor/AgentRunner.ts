import { Executor } from './Executor'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { TxListener } from './TxListener'
import { TriggerType } from '../service/triggerService'
import { saveTxLog } from '../utils/agent'
import { loadRootKeyFromBuffer } from '../utils/cardano'
import { HdWallet } from 'libcardano'
import { AgentWalletDetails } from '../types/types'
import { globalState } from '../constants/global'
import { EventContext } from './BaseFunction'
import { LLMService } from '../service/LLMService'

export class AgentRunner {
    executor: Executor
    managerInterface: ManagerInterface

    constructor(managerInterface: ManagerInterface, txListener: TxListener) {
        this.managerInterface = managerInterface
        this.executor = new Executor(null, managerInterface, txListener)
    }

    async invokeFunction(
        triggerType: TriggerType,
        instanceIndex: number,
        method: string,
        ...args: any
    ) {
        const extractedArgs = this.extractArgumentValues(args)
        const shouldUseLLM = this.shouldUseLLMForFunction(method)
        if (shouldUseLLM) {
            console.log('[AgentRunner] LLM gating enabled for', method)
            console.log(
                '[AgentRunner] GEMINI_API_KEY present:',
                !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY
            )
            try {
                const llm = new LLMService()
                console.log(
                    '[AgentRunner] functionLLMSettings:',
                    JSON.stringify(globalState.functionLLMSettings, null, 2)
                )
                const userPrefText = this.getUserPreferenceText(method)
                console.log(
                    '[AgentRunner] user policy for',
                    method,
                    ':',
                    userPrefText || '(empty)'
                )
                const structuredPrefs = {}
                const decision = await llm.shouldExecuteFunction(
                    method,
                    extractedArgs,
                    structuredPrefs,
                    userPrefText,
                    globalState.systemPrompt
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
                    saveTxLog(
                        blocked,
                        this.managerInterface,
                        triggerType,
                        instanceIndex
                    )
                    return
                }
            } catch (e) {
                console.error(`LLM gating Failed, we are continuing : ${e}`)
            }
        }
        this.executor.invokeFunction(method, ...args).then((result) => {
            saveTxLog(result, this.managerInterface, triggerType, instanceIndex)
        })
    }

    async invokeFunctionWithEventContext(
        eventFilterContext: any,
        context: EventContext,
        triggerType: TriggerType,
        instanceIndex: number,
        method: string,
        parameters: any[]
    ) {
        const eventContext = {
            event: context,
            filter: eventFilterContext,
            parameters,
        }
        const params = await this.executor
            .filterFunctionParams(method, eventContext)
            .catch((err) => console.error('Function Invocation Error: ', err))

        if (params) {
            this.executor.invokeFunctionWithContext(eventContext, method, ...params).then((result) => {
                saveTxLog(result, this.managerInterface, triggerType, instanceIndex)
            })
        }
    }

    private shouldUseLLMForFunction(method: string): boolean {
        const fnCfg = globalState.functionLLMSettings?.[method]
        if (fnCfg && fnCfg.enabled) {
            return true
        } else {
            return false
        }
    }

    private getUserPreferenceText(method: string): string {
        console.log(
            `globalState function llm settins bhitra -> ${globalState.functionLLMSettings}`
        )
        return globalState.functionLLMSettings?.[method]?.userPrefText || ''
    }

    private extractArgumentValues(args: any[]) {
        return args.map((a) =>
            a && typeof a === 'object' && 'value' in a ? a.value : a
        )
    }

    async remakeContext(index: number) {
        const rootKey = loadRootKeyFromBuffer()
        const hdWallet = HdWallet.fromHdKey(rootKey)
        const account = await hdWallet.getAccount(index)
        const accountWallet = await account.singleAddressWallet()
        const agentInstanceWallet: AgentWalletDetails = {
            payment_signing_key: accountWallet.paymentKey.private.toString('hex'),
            stake_signing_key: accountWallet.stakeKey!.private.toString('hex'),
            payment_verification_key_hash: accountWallet.paymentKey.pkh.toString('hex'),
            stake_verification_key_hash: accountWallet.stakeKey!.pkh.toString('hex'),
            agent_address: accountWallet.getAddress(0).toBech32(),
            drep_id: accountWallet.stakeKey!.pkh.toString('hex'),
        }
        this.executor.remakeContext(agentInstanceWallet, this.managerInterface, `${globalState.agentName}#${index}`)
    }
}
