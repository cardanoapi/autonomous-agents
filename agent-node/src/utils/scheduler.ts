import cron, { ScheduledTask } from 'node-cron'
import { Action, Configuration } from '../service/triggerService'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { AgentTransactionBuilder } from '../service/transactionBuilder'
import { TriggerActionHandler } from '../service/TriggerActionHandler'

let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}

function createTask(
    triggerHandler: TriggerActionHandler,
    manager: ManagerInterface,
    action: Action,
    frequency: string,
    probability: number
) {
    const transactionBuilder = AgentTransactionBuilder.getInstance()

    return cron.schedule(frequency, () => {
        if (
            Math.random() > probability ||
            !transactionBuilder?.agentWalletDetails
        ) {
            manager.logTx({
                function_name: action.function_name,
                triggerType: 'CRON',
                trigger: false,
                success: false,
                message: '',
            })
        } else {
            triggerHandler.setTriggerOnQueue(action, 'CRON')
        }
    })
}

export function scheduleFunctions(
    triggerHandler: TriggerActionHandler,
    manager: ManagerInterface,
    configurations: Configuration[]
) {
    clearScheduledTasks()

    configurations.forEach((config) => {
        const { data, action, type } = config
        if (action && type === 'CRON') {
            const { frequency, probability } = data
            const task = createTask(
                triggerHandler,
                manager,
                action,
                frequency,
                probability
            )
            scheduledTasks.push(task)
        }
    })
}
