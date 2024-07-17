import { Action, Configuration } from '../service/triggerService'
import { globalState } from '../constants/global'
import { scheduleFunctions } from './scheduler'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { triggerHandler } from '../service/TriggerActionHandler'
import { AgentTransactionBuilder } from '../service/transactionBuilder'

export function checkIfAgentWithTriggerTypeExists(
    configurations: Configuration[]
) {
    configurations.map((config) => {
        if (config.type === 'EVENT') {
            globalState.eventTriggerTypeDetails = {
                eventType: true,
                function_name: config.action.function_name,
            }
        }
    })
}

export function createActionDtoForEventTrigger(tx: any, index: number): Action {
    return {
        function_name: globalState.eventTriggerTypeDetails.function_name,
        parameters: [
            {
                name: 'proposal',
                value: `${Buffer.from(tx.hash, 'utf-8').toString('hex')}#${index}`,
            },
        ],
    }
}

export const RpcTopicHandler: Record<string, any> = {
    extend_block: (block: any) => {
        const transactions = parseRawBlockBody(block.body)
        transactions.length &&
            transactions.forEach((tx: any) => {
                const txHash = Buffer.from(tx.hash, 'utf-8').toString('hex')
                if (txHash === triggerHandler.txHash) {
                    console.log('TxHash for action has been matched')
                    triggerHandler.clearTimeoutAndTrigger()
                }
            })
        if (
            globalState.eventTriggerTypeDetails.eventType &&
            transactions.length
        ) {
            transactions.forEach((tx: any) => {
                if (Array.isArray(tx.body.proposalProcedures)) {
                    tx.body.proposalProcedures.forEach(
                        (proposal: any, index: number) => {
                            triggerHandler.setTriggerOnQueue(
                                createActionDtoForEventTrigger(tx, index),
                                'EVENT'
                            )
                        }
                    )
                }
            })
        }
    },
    initial_config: (message: any) => {
        const { configurations } = message
        checkIfAgentWithTriggerTypeExists(configurations)
        scheduleFunctions(configurations)
    },
    config_updated: (message: any) => {
        const { configurations } = message
        checkIfAgentWithTriggerTypeExists(configurations)
        scheduleFunctions(configurations)
    },
    agent_keys: (message: any) => {
        AgentTransactionBuilder.setInstance(message)
    },
}
