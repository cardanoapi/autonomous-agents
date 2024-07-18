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

export class TriggerActionHandler {
    triggerQueue: Array<ITrigger> = []
    txHash = ''
    managerInterface: ManagerInterface
    private timeOut: any

    constructor(managerInterface: ManagerInterface) {
        this.managerInterface = managerInterface
    }

    onTxsConfirmed(txsHash: Buffer[]) {
        console.log(
            'Received txs',
            txsHash.map((tx) => tx.toString('hex'))
        )
        txsHash.forEach((tx: any) => {
            const txHash = Buffer.from(tx, 'utf-8').toString('hex')
            if (txHash === this.txHash) {
                console.log('Pending Tx Confirmed :', txHash)
                this.clearTimeoutAndTrigger()
            }
        })
    }

    setTimeOut() {
        console.log('Timout initialized of 80 second: ', this.triggerQueue)
        this.timeOut = setTimeout(() => {
            if (this.triggerQueue.length) {
                this.triggerQueue = removeRedundantTrigger(this.triggerQueue)
            }
            const trigger = this.triggerQueue.shift()
            if (trigger) {
                this.triggerAndLogAction(trigger)
            } else {
                console.log('SetTimeOut: Task Queue is empty')
            }
        }, 80000)
    }

    clearTimeoutAndTrigger() {
        if (this.timeOut) {
            clearTimeout(this.timeOut)
            this.timeOut = null
        }
        const trigger = this.triggerQueue.shift()
        if (trigger) {
            this.triggerAndLogAction(trigger)
        } else {
            console.log('ClearTimeoutAndTrigger : Task Queue is empty')
        }
    }

    triggerAndLogAction(trigger: ITrigger) {
        const { action, triggerType } = trigger
        const result: ILog = {
            function_name: action.function_name,
            triggerType: triggerType,
            trigger: true,
            message: '',
            success: true,
        }
        triggerAction(
            this,
            this.managerInterface,
            action['function_name'],
            action['parameters'],
            triggerType
        )
            .then((res) => {
                console.log('Tx Hash of res is : ', res)
                if (res) {
                    result.txHash = res.hash
                    this.txHash = res.hash
                } else {
                    result.triggerType = ''
                }
                this.setTimeOut()
            })
            .catch((e) => {
                console.log('Tx Error : ', e)
                result.success = false
                result.message = e?.message || 'Unknown error :' + e?.toString()
                this.clearTimeoutAndTrigger()
            })
            .finally(() => {
                if (triggerType !== '' && result.message !== 'Skip') {
                    this.managerInterface.logTx(result)
                }
            })
    }

    setTriggerOnQueue(action: Action, triggerType: TriggerType) {
        if (this.timeOut) {
            this.triggerQueue.push({ action, triggerType })
        } else {
            this.setTimeOut()
            this.triggerAndLogAction({ action, triggerType })
        }
    }
}

function removeRedundantTrigger(triggerQueue: Array<ITrigger>) {
    const firstTrigger = triggerQueue.at(0)
    const secondTrigger = triggerQueue.at(1)
    if (
        firstTrigger?.triggerType === secondTrigger?.triggerType &&
        firstTrigger?.action.function_name ===
            secondTrigger?.action.function_name
    ) {
        triggerQueue.shift()
    }
    return triggerQueue
}
