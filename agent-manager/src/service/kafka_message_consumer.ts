import { Kafka, KafkaMessage } from 'kafkajs'
import { ManagerService } from './ManagerService'
import { AgentManagerRPC } from './AgentManagerRPC'
import { fetchAgentConfiguration } from '../repository/agent_manager_repository'
import environments from '../config/environments'

const config = environments.kafka
const configTopic = `${config.topicPrefix || config.prefix || 'agent'}-updates`
const triggerTopic = `${config.topicPrefix || config.prefix || 'agent'}-triggers`
const topicList = [configTopic, triggerTopic]
const brokers = config.brokers
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x && x.length > 0)
const groupId = config.consumerGroup || `${config.prefix || 'agent'}-manager`

const kafka = new Kafka({
    clientId: config.clientId ? config.clientId : `${config.prefix || 'agent'}-manager`,
    brokers, // Update with your Kafka broker address
})

const consumer = kafka.consumer({ groupId })

export async function initKafkaConsumers(manager: AgentManagerRPC) {
    console.log('[Kafka]', `brokers:${brokers}, groupId:${groupId}, topics:${topicList}`)
    const managerService = new ManagerService(manager)
    await consumer.connect().catch((e) => {
        console.error('Error connecting consumer', e)
    })
    await consumer
        .subscribe({
            topics: topicList,
            fromBeginning: true,
        })
        .catch((e) => {
            console.error('Error subscribing', e)
        })

    const configUpdateHandler = async (message: KafkaMessage) => {
        const agentId = message.key?.toString() || ''
        const isActive = managerService.isAgentActive(agentId)
        if (isActive) {
            const updatedConfigs = await fetchAgentConfiguration(agentId)
            managerService.sendToWebSocket(agentId, 'config_updated', updatedConfigs)
        }
    }
    const manualTriggerHandler = (message: KafkaMessage) => {
        const agentSecretKey = message.key?.toString()
        const methodConfig = message.value?.toString()
        const parsedMethodConfig = JSON.parse(methodConfig || '')
        if (agentSecretKey && parsedMethodConfig) {
            const method = parsedMethodConfig.method
            const parameters = parsedMethodConfig.parameters
            if (method === 'Agent_Deletion') {
                managerService.disconnectWebsocketConnection(
                    agentSecretKey,
                    `Due to deletion,Agent with token ${agentSecretKey} is disconnected.`
                )
            } else {
                console.log(parsedMethodConfig)
                manager.isActive(agentSecretKey) && manager.fireMethod(agentSecretKey, method, ...parameters)
            }
        }
    }

    await consumer.run({
        eachMessage: async ({ message, topic }) => {
            console.info('topic=', topic, 'message=', message.value)
            if (topic == configTopic) {
                configUpdateHandler(message)
            } else {
                manualTriggerHandler(message)
            }
        },
    })
}
