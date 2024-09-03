import { ManagerInterface } from './ManagerInterfaceService'
import { TxListener } from '../executor/TxListener'
import { Executor } from '../executor/Executor'
import { BlockEvent } from 'libcardano/types'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { globalState } from '../constants/global'
import { scheduleFunctions } from '../utils/scheduler'
import {
    checkIfAgentWithEventTriggerTypeExists,
    createActionDtoForEventTrigger,
    saveTxLog,
} from '../utils/agent'

export class RpcTopicHandler {
    managerInterface: ManagerInterface
    txListener: TxListener
    executor: Executor
    constructor(
        managerInterface: ManagerInterface,
        txListener: TxListener,
        executor: Executor
    ) {
        this.managerInterface = managerInterface
        this.txListener = txListener
        this.executor = executor
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
        const transactions = parseRawBlockBody(block.body)
        console.log(
            '[ New Block ]',
            'block=' + block.headerHash.toString('hex'),
            'slotNo=' + block.slotNo,
            'blockNo=' + block.blockNo,
            'txCount=' + transactions.length
        )
        this.txListener.onBlock({ ...block, body: transactions })
        if (
            globalState.eventTriggerTypeDetails.eventType &&
            transactions.length
        ) {
            transactions.forEach((tx: any) => {
                if (Array.isArray(tx.body.proposalProcedures)) {
                    tx.body.proposalProcedures.forEach(
                        (proposal: any, index: number) => {
                            const { function_name, parameters } =
                                createActionDtoForEventTrigger(tx, index)
                            this.executor
                                .invokeFunction(
                                    function_name,
                                    ...(parameters as any)
                                )
                                .then((result) => {
                                    saveTxLog(
                                        result,
                                        this.managerInterface,
                                        'EVENT'
                                    )
                                })
                        }
                    )
                }
            })
        }
    }
    initial_config(message: any) {
        const { configurations } = message
        checkIfAgentWithEventTriggerTypeExists(configurations)
        scheduleFunctions(this.managerInterface, this.executor, configurations)
    }
    config_updated(message: any) {
        const { configurations } = message
        checkIfAgentWithEventTriggerTypeExists(configurations)
        scheduleFunctions(this.managerInterface, this.executor, configurations)
    }

    agent_keys(message: any) {}
}
