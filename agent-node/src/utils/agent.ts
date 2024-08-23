import {
    Action,
    ActionParameter,
    Configuration,
} from '../service/triggerService'
import { globalState } from '../constants/global'
import { scheduleFunctions } from './scheduler'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { ILog } from '../service/TriggerActionHandler'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { BlockEvent } from 'libcardano/types'
import { TxListener } from '../executor/TxListener'
import { Executor } from '../executor/Executor'

export function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): any {
    const param = parameters.find((param) => param && param.name === name)
    return param ? param.value : ''
}

export function checkIfAgentWithEventTriggerTypeExists(
    configurations: Configuration[]
) {
    configurations.forEach((config) => {
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
                                    result.forEach((log: any) => {
                                        const txLog: ILog = {
                                            function_name: log.function,
                                            triggerType: 'EVENT',
                                            trigger: true,
                                            success: true,
                                            message: '',
                                        }
                                        if (log.return) {
                                            txLog.txHash = log.return.hash
                                        } else {
                                            txLog.message =
                                                log.error &&
                                                (log.error.message ?? log.error)
                                            txLog.success = false
                                        }
                                        this.managerInterface.logTx(txLog)
                                    })
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
