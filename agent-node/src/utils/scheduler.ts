import cron, { ScheduledTask } from 'node-cron'
import { Action, Configuration } from '../service/triggerService'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { Executor } from '../executor/Executor'
import { saveTxLog } from './agent'

let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}

function createTask(
    executor: Executor,
    manager: ManagerInterface,
    action: Action,
    frequency: string,
    probability: number
) {
    return cron.schedule(frequency, () => {
        if (Math.random() > probability) {
            manager.logTx({
                function_name: action.function_name,
                triggerType: 'CRON',
                trigger: false,
                success: false,
                message: '',
            })
        } else {
            executor
                .invokeFunction(
                    action.function_name,
                    ...(action.parameters as any)
                )
                .then((result) => {
                    saveTxLog(result, manager, 'CRON')
                })
        }
    })
}

export function scheduleFunctions(
    manager: ManagerInterface,
    executor: Executor,
    configurations: Configuration[]
) {
    clearScheduledTasks()

    configurations.forEach((config) => {
        const { data, action, type } = config
        if (action && type === 'CRON') {
            const { frequency, probability } = data
            const task = createTask(
                executor,
                manager,
                action,
                frequency,
                probability
            )
            scheduledTasks.push(task)
        }
    })
}
