import { Action, Configuration } from '../service/triggerService'
import { globalState } from '../constants/global'
import { scheduleFunctions } from './scheduler'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { AgentTransactionBuilder } from '../service/transactionBuilder'
import { TriggerActionHandler } from '../service/TriggerActionHandler'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { BlockEvent } from 'libcardano/types'
import { TxListener } from '../executor/TxListener'

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

export class RpcTopicHandler {
    triggerHandler: TriggerActionHandler
    managerInterface: ManagerInterface
    txListener: TxListener
    constructor(
        triggerHandler: TriggerActionHandler,
        managerInterface: ManagerInterface,
        txListener: TxListener
    ) {
        this.managerInterface = managerInterface
        this.triggerHandler = triggerHandler
        this.txListener = txListener
    }
    handleEvent(eventName: string, message: any) {
        const handler = (this as any)[eventName]
        if (handler === undefined || eventName === 'constructor') {
            console.error('Unknown event type', eventName, 'received')
        } else {
            handler.bind(this)(message) // Ensure the correct `this` context
        }
    }

    extend_block(block: BlockEvent) {
        console.log(
            'extend_block',
            'block=' + block.headerHash.toString('hex'),
            'slotNo=' + block.slotNo,
            'blockNo=' + block.blockNo
        )
        const transactions = parseRawBlockBody(block.body)
        this.txListener.onBlock({ ...block, body: transactions })
        if (
            globalState.eventTriggerTypeDetails.eventType &&
            transactions.length
        ) {
            transactions.forEach((tx: any) => {
                if (Array.isArray(tx.body.proposalProcedures)) {
                    tx.body.proposalProcedures.forEach(
                        (proposal: any, index: number) => {
                            this.triggerHandler.setTriggerOnQueue(
                                createActionDtoForEventTrigger(tx, index),
                                'EVENT'
                            )
                        }
                    )
                }
            })
        }
    }
    initial_config(message: any) {
        const { configurations } = message
        checkIfAgentWithTriggerTypeExists(configurations)
        scheduleFunctions(
            this.triggerHandler,
            this.managerInterface,
            configurations
        )
    }
    config_updated(message: any) {
        const { configurations } = message
        checkIfAgentWithTriggerTypeExists(configurations)
        scheduleFunctions(
            this.triggerHandler,
            this.managerInterface,
            configurations
        )
    }
    agent_keys(message: any) {
        AgentTransactionBuilder.setInstance(message)
    }
}
