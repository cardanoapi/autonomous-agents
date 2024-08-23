import cron, { ScheduledTask } from 'node-cron'
import { Action, Configuration } from '../service/triggerService'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { ILog } from '../service/TriggerActionHandler'
import { Executor } from '../executor/Executor'

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
                    result.forEach((log: any) => {
                        const txLog: ILog = {
                            function_name: log.function,
                            triggerType: 'CRON',
                            trigger: true,
                            success: true,
                            message: '',
                        }
                        if (log.return) {
                            txLog.txHash = log.return.hash
                        } else {
                            txLog.message =
                                log.error && (log.error.message ?? log.error)
                            txLog.success = false
                        }
                        manager.logTx(txLog)
                    })
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
