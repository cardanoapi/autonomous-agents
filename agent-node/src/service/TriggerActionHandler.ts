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

export interface ITrigger {
    action: Action
    triggerType: TriggerType
}

class TriggerActionHandler {
    triggerQueue: Array<ITrigger> = []
    txHash = ''
    private timeOut: any

    setTimeOut() {
        console.log('Timout initialized : ', this.triggerQueue)
        this.timeOut = setTimeout(() => {
            if (this.triggerQueue.length) {
                this.triggerQueue = removeRedundantTrigger(this.triggerQueue)
            }
            const trigger = this.triggerQueue.pop()
            if (trigger) {
                this.triggerAndLogAction(trigger)
            } else {
                console.log('No Task Available')
            }
            console.log('Timeout starting')
        }, 80000)
    }

    clearTimeoutAndTrigger() {
        if (this.timeOut) {
            clearTimeout(this.timeOut)
        }
        const trigger = this.triggerQueue.pop()
        if (trigger) {
            this.triggerAndLogAction(trigger)
        } else {
            console.log('No Task to trigger.')
        }
        this.setTimeOut()
    }

    triggerAndLogAction(trigger: ITrigger) {
        const { action, triggerType } = trigger
        const managerInterface = ManagerInterface.getInstance()
        const result: ILog = {
            function_name: action.function_name,
            triggerType: triggerType,
            trigger: true,
            message: '',
            success: true,
        }
        triggerAction(action['function_name'], action['parameters'])
            .then((res) => {
                console.log('Tx Hash of res is : ', res)
                if (res) {
                    result.txHash = res.hash
                    this.txHash = res.hash
                    this.setTimeOut()
                } else {
                    throw new Error('Something went wrong')
                }
            })
            .catch((e) => {
                console.log('Tx Error : ', e)
                result.success = false
                result.message = e?.message || 'Unknown error :' + e?.toString()
                this.clearTimeoutAndTrigger()
            })
            .finally(() => {
                managerInterface?.logTx(result)
            })
    }

    setTriggerOnQueue(action: Action, triggerType: TriggerType) {
        if (this.timeOut) {
            this.triggerQueue.push({ action, triggerType })
        } else {
            this.triggerAndLogAction({ action, triggerType })
        }
    }
}

function removeRedundantTrigger(triggerQueue: Array<ITrigger>) {
    const lastTrigger = triggerQueue.at(-1)
    const secondLastTrigger = triggerQueue.at(-2)
    if (
        lastTrigger?.triggerType === secondLastTrigger?.triggerType &&
        lastTrigger?.action.function_name ===
            secondLastTrigger?.action.function_name
    ) {
        triggerQueue.pop()
    }
    return triggerQueue
}

export const triggerHandler = new TriggerActionHandler()
