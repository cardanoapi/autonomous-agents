import {
    Action,
    ActionParameter,
    Configuration,
    TriggerType,
} from '../service/triggerService'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { CallLog } from '../executor/Executor'
import { ILog, InternalLog } from '../service/TriggerActionHandler'
import { DateTime } from 'luxon'
import { IEventBasedAction, IFilterNode } from '../types/eventTriger'

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
    const eventBasedAction: IEventBasedAction[] = []
    configurations.forEach((config) => {
        if (config.type === 'EVENT') {
            eventBasedAction.push({
                eventTrigger: config.data as unknown as IFilterNode,
                triggeringFunction: config.action,
            })
        }
    })
    return eventBasedAction.flat()
}

export function createActionDtoForEventTrigger(tx: any, index: number): Action {
    return {
        function_name: 'voteOnProposal',
        parameters: [
            {
                name: 'proposal',
                value: `${Buffer.from(tx.hash, 'utf-8').toString('hex')}#${index}`,
            },
        ],
    }
}

export function saveTxLog(
    callLogs: CallLog[],
    managerInterface: ManagerInterface,
    triggerType: TriggerType,
    instanceIndex: number
) {
    try {
        const mainLog = callLogs.shift()
        if (mainLog) {
            const internalLogs: InternalLog[] = []
            const txLog: ILog = {
                function_name: mainLog.function,
                triggerType: triggerType,
                trigger: true,
                success: true,
                message: '',
                instanceIndex: instanceIndex,
                parameters: mainLog.arguments,
            }
            if (mainLog.return) {
                txLog.result = mainLog.return
                txLog.txHash = mainLog.return.hash
            } else if (mainLog.error) {
                txLog.result = mainLog.error
                txLog.message =
                    mainLog.error &&
                    ((mainLog.error as Error).message ?? mainLog.error)
                txLog.success = false
            }
            callLogs.length &&
                callLogs.forEach((log: any) => {
                    const internalLog: InternalLog = {
                        function_name: log.function,
                        success: true,
                        message: '',
                        parameters: log.arguments,
                    }
                    if (log.return) {
                        internalLog.result = log.return
                        internalLog.txHash = log.return.hash
                    } else if (log.error) {
                        internalLog.result = log.error
                        internalLog.message =
                            log.error && (log.error.message ?? log.error)
                        internalLog.success = false
                    }
                    internalLog.timeStamp = DateTime.utc().toISO()
                    internalLogs.push(internalLog)
                })
            if (internalLogs.length) {
                txLog.internal = internalLogs
            }
            managerInterface.logTx(txLog)
            console.log('Method call log', mainLog)
        } else {
            console.log('No log found')
        }
    } catch (err) {
        console.error('SaveTxLogError :', err)
    }
}
