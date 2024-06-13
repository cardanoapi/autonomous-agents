import { globalState } from './global'
import cron, { ScheduledTask } from 'node-cron'
import { sendDataToWebSocket } from '.'
import kuberService from './transaction-service'

// Define the types for the action parameter and action
export interface ActionParameter {
    name: string
    value: string
}

export interface Action {
    parameter: ActionParameter[]
    function_name: string
}

export interface Data {
    frequency: string
    probability: number
}

export interface Configuration {
    id: string
    type: string
    data: Data
    action: Action
}
let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}

export async function scheduleFunctions(configurations: any[]) {
    clearScheduledTasks()

    configurations.forEach((config: Configuration) => {
        const { data, action } = config
        if (action) {
            const { frequency, probability } = data

            const task = cron.schedule(frequency, async () => {
                if (
                    Math.random() > probability ||
                    !globalState.agentWalletDetails
                ) {
                    const actionWithTrigInfo = {
                        action,
                        messageType: 'action',
                        trigger: 'false',
                    }
                    await sendDataToWebSocket(
                        JSON.stringify(actionWithTrigInfo)
                    )
                } else {
                    switch (action.function_name) {
                        case 'SendAda Token':
                            await sendDataToWebSocket(
                                JSON.stringify({
                                    action,
                                    messageType: 'action',
                                    trigger: 'true',
                                    payload: kuberService.transferADA(
                                        [
                                            getParameterValue(
                                                action.parameter,
                                                'Receiver Address'
                                            ) || '',
                                        ],
                                        10,
                                        globalState.agentWalletDetails!
                                            .agent_address,
                                        globalState.agentWalletDetails!
                                            .payment_signing_key
                                    ),
                                })
                            )
                    }
                }
            })
            scheduledTasks.push(task)
        }
    })
}

function getParameterValue(
    parameters: ActionParameter[],
    name: string
): string | undefined {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : undefined
}
