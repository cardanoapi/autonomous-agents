import {
    Action,
    ActionParameter,
    Configuration,
    TriggerType,
} from '../service/triggerService'
import { globalState } from '../constants/global'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { CallLog } from '../executor/Executor'
import { ILog } from '../service/TriggerActionHandler'

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

export function saveTxLog(
    callLogs: CallLog[],
    managerInterface: ManagerInterface,
    triggerType: TriggerType,
    instanceIndex: number
) {
    callLogs.reverse().forEach((log: any, index) => {
        const txLog: ILog = {
            function_name: log.function,
            triggerType: index + 1 < callLogs.length ? 'INTERNAL' : triggerType,
            trigger: true,
            success: true,
            message: '',
            instanceIndex: instanceIndex,
        }
        if (log.return) {
            txLog.txHash = log.return.hash
        } else if (log.error) {
            txLog.message = log.error && (log.error.message ?? log.error)
            txLog.success = false
        }
        managerInterface.logTx(txLog)
    })
    console.log('Method call log', callLogs)
}
