import cron, { ScheduledTask } from 'node-cron'
import { Action, Configuration } from '../service/triggerService'
import { triggerHandler } from '../service/TriggerActionHandler'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { AgentTransactionBuilder } from '../service/transactionBuilder'

let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}

function createTask(action: Action, frequency: string, probability: number) {
    const managerInterface = ManagerInterface.getInstance()
    const transactionBuilder = AgentTransactionBuilder.getInstance()

    return cron.schedule(frequency, () => {
        if (
            Math.random() > probability ||
            !transactionBuilder?.agentWalletDetails
        ) {
            managerInterface?.logTx({
                function_name: action.function_name,
                triggerType: 'CRON',
                trigger: false,
                success: false,
                message: '',
            })
        } else {
            triggerHandler.triggerAndLogAction(action, 'CRON')
        }
    })
}

export function scheduleFunctions(configurations: Configuration[]) {
    clearScheduledTasks()

    configurations.forEach((config) => {
        const { data, action, type } = config
        if (action && type === 'CRON') {
            const { frequency, probability } = data
            const task = createTask(action, frequency, probability)
            scheduledTasks.push(task)
        }
    })
}
