import cron, { ScheduledTask } from 'node-cron';
import { Add, Sub } from './functions';

// Define an array to keep track of scheduled tasks
let scheduledTasks: ScheduledTask[] = [];

// Function to clear previously scheduled tasks
function clearScheduledTasks() {
    scheduledTasks.forEach(task => {
        task.stop(); // Cancel the scheduled task
    });

    // Clear the list of scheduled tasks
    scheduledTasks = [];
}

// Function to schedule functions based on configurations
export async function scheduleFunctions(configurations: any[]) {
    // Clear previously scheduled tasks
    clearScheduledTasks();

    // Iterate over configurations and schedule functions
    configurations.forEach((config: any) => {
        const { data, action } = config;

        // Determine the function to call based on the function name
        let functionToCall: Function | null = null;
        if (action.function_name === 'Add') {
            functionToCall = Add;
        } else if (action.function_name === 'Sub') {
            functionToCall = Sub;
        }

        // If the function is defined, schedule it according to the cron expression
        if (functionToCall) {
            // Get the cron expression and probability from the data
            const { frequency, probability } = data;

            // Schedule the function using node-cron
            const task = cron.schedule(frequency, () => {
                // Only trigger the function based on probability
                if (Math.random() < probability) {
                    functionToCall(action.parameter);
                }
            });

            // Add the scheduled task to the list
            scheduledTasks.push(task);
        }
    });
}
