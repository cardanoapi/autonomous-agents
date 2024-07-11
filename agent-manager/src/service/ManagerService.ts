import { AgentManagerRPC } from './AgentManagerRPC'

export class ManagerService {
    manager
    constructor(manager: AgentManagerRPC) {
        this.manager = manager
    }

    sendToWebSocket(agentId: string, topic: string, message: any) {
        this.manager.withClient(agentId, (c) => {
            c.emit(topic, JSON.stringify(message))
        })
    }

    isAgentActive(agentId: string) {
        return this.manager.isActive(agentId)
    }

    disconnectWebsocketConnection(agentId: string, reason: string) {
        const isActive = this.isAgentActive(agentId)
        if (isActive) {
            this.manager.disconnect(agentId, reason)
            console.log(reason)
        } else {
            console.log(`Agent with id ${agentId} does not exist.`)
        }
    }
}
