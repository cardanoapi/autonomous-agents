import { Kafka, KafkaMessage } from "kafkajs";
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

const consumer = kafka.consumer({ groupId: environments.kafkaConsumerGroup || `${  kafka_prefix}-agent-manager` })


const configTopic=`${environments.kafkaTopicPrefix || kafka_prefix}-updates`
const triggerTopic = `${environments.kafkaTopicPrefix  || kafka_prefix}-triggers`

export async function initKafkaConsumers(manager: AgentManagerRPC) {
    const managerService = new ManagerService(manager)
    await consumer.connect().catch(e=>{
        console.error("Error connecting consumer",e)
    })
    await consumer.subscribe({
        topics: [configTopic,triggerTopic],
        fromBeginning: true,
    }).catch(e=>{
        console.error("Error subscribing",e)
    })

    const configUpdateHandler= async (message:KafkaMessage)=>{
        const agentId = message.key?.toString() || ''
        const isActive = managerService.isAgentActive(agentId)
        if (isActive) {
            const updatedConfigs = await fetchAgentConfiguration(agentId)
            managerService.sendToWebSocket(agentId, 'config_updated', updatedConfigs)
        }
    }
    const manualTriggerHandler=(message:KafkaMessage)=>{
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
    }

    await consumer.run({
        eachMessage: async ({ message,topic }) => {
            if(topic == configTopic){
                configUpdateHandler(message)
            }else{
                manualTriggerHandler(message)
            }
        },
    })

}
