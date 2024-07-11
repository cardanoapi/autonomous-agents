import { Action, triggerAction, TriggerType } from './triggerService'
import { ManagerInterface } from './ManagerInterfaceService'

export interface ILog {
    function_name: string
    message: string
    txHash?: string
    triggerType: TriggerType
    trigger: boolean
    success: boolean
}
class TriggerActionHandler {
    triggerAndLogAction(action: Action, triggerType: TriggerType) {
        const managerInterface = ManagerInterface.getInstance()
        const result: ILog = {
            function_name: action.function_name,
            triggerType: triggerType,
            trigger: true,
            message: '',
            success: true,
        }
        triggerAction(action['function_name'], action['parameter'])
            .then((res) => {
                if (res) {
                    result.txHash = res.hash
                }
            })
            .catch((e) => {
                console.log('Tx Error : ', e)
                result.success = false
                result.message = e?.message || 'Unknown error :' + e?.toString()
            })
            .finally(() => {
                managerInterface?.logTx(result)
            })
    }
}

export const triggerHandler = new TriggerActionHandler()
