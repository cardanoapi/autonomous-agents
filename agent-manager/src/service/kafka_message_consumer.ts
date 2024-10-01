import { Kafka } from 'kafkajs'
import { ManagerService } from './ManagerService'
import { AgentManagerRPC } from './AgentManagerRPC'
import { fetchAgentConfiguration } from '../repository/agent_manager_repository'
import environments from '../config/environments'

const brokerUrl = environments.brokerUrl
const kafka = new Kafka({
    clientId: environments.clientId,
    brokers: [brokerUrl], // Update with your Kafka broker address
})
const kafka_prefix = environments.kafkaPrefix

const consumer = kafka.consumer({ groupId: 'agent-manager-configs' })

const manualTriggerConsumer = kafka.consumer({
    groupId: 'agent-manager-actions',
})

export async function initKafkaConsumers(manager: AgentManagerRPC) {
    const managerService = new ManagerService(manager)
    await consumer.connect()
    await consumer.subscribe({
        topic: `${kafka_prefix}trigger_config_updates`,
        fromBeginning: true,
    })

    await consumer.run({
        eachMessage: async ({ message }) => {
            const agentId = message.key?.toString() || ''
            const isActive = managerService.isAgentActive(agentId)
            if (isActive) {
                const updatedConfigs = await fetchAgentConfiguration(agentId)
                managerService.sendToWebSocket(agentId, 'config_updated', updatedConfigs)
            }
        },
    })

    // kafka message are consumed in RPC format
    await manualTriggerConsumer.connect()
    await manualTriggerConsumer.subscribe({ topic: `${kafka_prefix}Agent_Trigger` })

    await manualTriggerConsumer.run({
        eachMessage: async ({ message }) => {
            const agentId = message.key?.toString()
            const methodConfig = message.value?.toString()
            const parsedMethodConfig = JSON.parse(methodConfig || '')
            if (agentId && parsedMethodConfig) {
                const method = parsedMethodConfig.method
                const parameters = parsedMethodConfig.parameters
                if (method === 'Agent_Deletion') {
                    managerService.disconnectWebsocketConnection(
                        agentId,
                        `Due to deletion,Agent with id ${agentId} is disconnected.`
                    )
                } else {
                    console.log(parsedMethodConfig)
                    manager.isActive(agentId) && manager.fireMethod(agentId, method, ...parameters)
                }
            }
        },
    })
}
