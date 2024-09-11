import cron, { ScheduledTask } from 'node-cron'
import { Action, Configuration } from '../service/triggerService'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { AgentRunner } from '../executor/AgentRunner'

export function clearScheduledTasks(scheduledTasks: ScheduledTask[]) {
    scheduledTasks.forEach((task) => {
        task.stop()
    })
    scheduledTasks.length = 0
}

function createTask(
    agentRunner: AgentRunner,
    manager: ManagerInterface,
    action: Action,
    frequency: string,
    probability: number,
    instanceIndex: number
) {
    return cron.schedule(
        frequency,
        () => {
            if (Math.random() > probability) {
                manager.logTx({
                    function_name: action.function_name,
                    triggerType: 'CRON',
                    trigger: false,
                    success: false,
                    message: '',
                    instanceIndex: instanceIndex,
                })
            } else {
                agentRunner.invokeFunction(
                    'CRON',
                    instanceIndex,
                    action.function_name,
                    ...(action.parameters as any)
                )
            }
        },
        {
            name: `agent-instance-#${instanceIndex}`,
        }
    )
}

export function scheduleFunctions(
    manager: ManagerInterface,
    runner: AgentRunner,
    configurations: Configuration[],
    instanceIndex: number,
    scheduledTasks: ScheduledTask[]
) {
    configurations.forEach((config) => {
        const { data, action, type } = config
        if (action && type === 'CRON') {
            const { frequency, probability } = data
            const task = createTask(
                runner,
                manager,
                action,
                frequency,
                probability,
                instanceIndex
            )
            scheduledTasks.push(task)
        }
        scheduledTasks.forEach((task) => task.start())
    })
}
