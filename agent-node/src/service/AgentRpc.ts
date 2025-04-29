import { RpcV1 } from 'libcardano/network/Rpc'

const agentId = process.env.AGENT_ID || ''

const getAgentId = () => agentId

type AgentEventType = 'methodCall' | 'event'
export class AgentRpc extends RpcV1 {
    handlers: Record<AgentEventType, any> = {
        methodCall: () => {},
        event: () => {},
    }
    handleMethodCall(method: string, args: any[]) {
        this.handlers['methodCall'](method, args)
    }
    on(eventType: 'methodCall', handler: (method: string, args: any[]) => any): void
    on(eventType: 'event', handler: (topic: string, message: any) => void): void
    on(eventType: AgentEventType, handler: any): void {
        this.handlers[eventType] = handler
    }
    onEvent(topic: string, message: any): void {
        this.handlers['event'](topic, message)
    }

    getId(): string {
        return getAgentId()
    }
}
