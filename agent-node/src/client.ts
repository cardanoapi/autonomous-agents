import { globalState } from './global'
import { scheduleFunctions, triggerAction } from './scheduler'
import WebSocket from 'ws'

// Function to handle incoming messages
export async function handleIncomingMessage(
    data: WebSocket.Data
): Promise<void> {
    try {
        // Parse the incoming JSON data
        const message = JSON.parse(data.toString())

        // Check if the message contains configurations
        if (message.message == 'initial') {
            const initial_message = JSON.stringify(message)
            console.log('Received initial configurations:', initial_message)
            // Schedule functions based on the received configurations
            await scheduleFunctions(message.configurations)
        } else if (message.message === 'config_updated') {
            // Update global configuration if received config_updated message
            console.log(
                'Received updated configurations:',
                JSON.stringify(message)
            )
            await scheduleFunctions(message.configurations)
        } else if (message.message === 'agent_keys') {
            console.log('Received Agent Keys: ', message.payload)
            globalState.agentWalletDetails = message.payload
        } else if (message.message === 'trigger_action') {
            const { action, probability } = message.payload
            triggerAction(action, probability)
        } else {
            console.log('Received message:', message)
        }
    } catch (error) {
        console.error('Error parsing incoming data:', error)
    }
}
