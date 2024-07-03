import { AgentWithTriggerTypeEvent, globalState } from './global'
import { Configuration, scheduleFunctions, triggerAction } from './scheduler'
import WebSocket from 'ws'

function checkIfAgentWithTriggerTypeExists(configurations: Configuration[]) {
    configurations.map((config) => {
        if (config.type === 'EVENT') {
            AgentWithTriggerTypeEvent.eventType = true
            AgentWithTriggerTypeEvent.function_name =
                config.action.function_name
        }
    })
}

function handleFunctionForEventTriggerType(transactions: any) {
    transactions.forEach((tx: any) => {
        if (Array.isArray(tx.body.proposalProcedures)) {
            tx.body.proposalProcedures.forEach(
                (proposal: any, index: number) => {
                    console.log(
                        `Proposal for event type of tx at index ${index} is :`,
                        JSON.stringify(proposal)
                    )
                    triggerAction(
                        {
                            function_name:
                                AgentWithTriggerTypeEvent.function_name,
                            parameter: [
                                {
                                    name: 'proposal',
                                    value: `${Buffer.from(tx.hash, 'utf-8').toString('hex')}#${index}`,
                                },
                            ],
                        },
                        1,
                        'EVENT'
                    )
                }
            )
        }
    })
}

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
            checkIfAgentWithTriggerTypeExists(message.configurations)
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
            triggerAction(action, probability, 'MANUAL')
        } else if (message.message === 'on_chain_tx') {
            console.log('Received on_chain_tx:', JSON.stringify(message))
            const { transactions } = message
            console.log(
                'GlobalAgentConfigDetails are : ',
                JSON.stringify(AgentWithTriggerTypeEvent),
                transactions
            )
            if (AgentWithTriggerTypeEvent.eventType) {
                handleFunctionForEventTriggerType(transactions)
            }
        } else {
            console.log('Received message:', message)
        }
    } catch (error) {
        console.error('Error parsing incoming data:', error)
    }
}
