import { Kafka } from 'kafkajs'
import manager from './agent_manager_service'

const brokerUrl = process.env.BROKER_URL || ''
const kafka = new Kafka({
    clientId: process.env['CLIENT_ID'],
    brokers: [brokerUrl], // Update with your Kafka broker address
})

// Initialize WebSocket manager

const consumer = kafka.consumer({ groupId: 'agent-manager-configs' })

const manualTriggerConsumer = kafka.consumer({
    groupId: 'agent-manager-actions',
})

export async function initKafkaConsumers() {
    consumer.connect()
    consumer.subscribe({
        topic: 'trigger_config_updates',
        fromBeginning: true,
    })

    consumer.run({
        eachMessage: async ({ message }) => {
            // Process message
            const agentId = message.key?.toString()
            if (agentId) {
                // Notify WebSocket manager about config update
                manager.sendToWebSocket(agentId, {
                    message: 'config_updated',
                })
            }
        },
    })

    manualTriggerConsumer.connect()
    manualTriggerConsumer.subscribe({ topic: 'manual_trigger_event' })

    manualTriggerConsumer.run({
        eachMessage: async ({ message }) => {
            const agentId = message.key?.toString()
            const actionName = message.value?.toString()
            const parsedActionName = JSON.parse(actionName || '')
            if (agentId && parsedActionName) {
                console.log('manual trigger starting', parsedActionName)
                if (
                    parsedActionName.function_name === 'delete_agent_websocket'
                ) {
                    const isAgentActive = await manager.checkIfAgentActive(
                        parsedActionName.agent_id
                    )
                    isAgentActive &&
                        (await manager.disconnectWebSocket(
                            parsedActionName.agent_id
                        ))
                    console.log(
                        `Agent with id ${parsedActionName.agent_id} is disconnected as it has been deleted`
                    )
                } else {
                    await manager.sendToWebSocket(agentId, {
                        message: 'trigger_action',
                        payload: {
                            action: {
                                function_name: parsedActionName.function_name,
                                parameter: parsedActionName.parameter,
                            },
                            probability: 1,
                        },
                    })
                }
            }
        },
    })
}
