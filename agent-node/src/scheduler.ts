import cron, { ScheduledTask } from 'node-cron'
import { TransactionKuber } from './kuber-transaction'
// interface FunctionData {
//     parameter: Parameter[]
//     function_name: string
// }
// interface Parameter {
//     name: string
//     value: string
// }

// Define an array to keep track of scheduled tasks
let scheduledTasks: ScheduledTask[] = []

// Function to clear previously scheduled tasks
function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop() // Cancel the scheduled task
    })

    // Clear the list of scheduled tasks
    scheduledTasks = []
}

// Function to schedule functions based on configurations
export async function scheduleFunctions(configurations: any[]) {
    // Clear previously scheduled tasks
    clearScheduledTasks()
    // const trigInfo: string = ''
    // Iterate over configurations and schedule functions
    configurations.forEach((config: any) => {
        const { data, action } = config
        if (action) {
            // Determine the function to call based on the function name
            let functionToCall: any = null
            if (action.function_name === 'Proposal New Constitution') {
                functionToCall = TransactionKuber
            } else if (action.function_name === 'SendAda Token') {
                functionToCall = TransactionKuber
            } else if (action.function_name === 'Vote') {
                functionToCall = TransactionKuber
            } else if (action.function_name === 'Delegation') {
                TransactionKuber(action)
            }

            // If the function is defined, schedule it according to the cron expression
            if (functionToCall) {
                // Get the cron expression and probability from the data
                const { frequency, probability } = data

                // Schedule the function using node-cron
                const task = cron.schedule(frequency, async () => {
                    // Only trigger the function based on probability
                    if (Math.random() < probability) {
                        const actionWithTrigInfo = {
                            ...action,
                            trigInfo: 'true',
                        }
                        await functionToCall(actionWithTrigInfo)
                    } else {
                        const actionWithTrigInfo = {
                            ...action,
                            trigInfo: 'false',
                        }
                        await functionToCall(actionWithTrigInfo)
                    }
                })

                // Add the scheduled task to the list
                scheduledTasks.push(task)
            }
        } else {
            data.topics == 'proposal'
            // sendParamsToWebSocket(JSON.stringify(data.topics))
        }
    })
}
