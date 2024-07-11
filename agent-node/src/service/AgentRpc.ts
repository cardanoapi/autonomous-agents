import { RpcV1 } from 'libcardano/network/Rpc'

import { Action } from './triggerService'
import { triggerHandler } from './TriggerActionHandler'
import { RpcTopicHandler } from '../utils/agent'

const TransactionType = [
    'vote',
    'SendAda Token',
    'Delegation',
    'Info Action Proposal',
    'Proposal New Constitution',
    'Drep Registration',
    'Drep deRegistration',
    'Register Stake',
    'Abstain Delegation',
    'No Confidence',
]

const agentId = process.env.AGENT_ID || ''

const getAgentId = () => agentId

export class AgentRpc extends RpcV1 {
    handleMethodCall(method: string, args: any[]) {
        console.log('Server called method', method, args)
        const params: Action = args[0]
        if (TransactionType.includes(method)) {
            triggerHandler.triggerAndLogAction(params, 'MANUAL')
        }
    }

    onEvent(topic: string, message: any): void {
        this.handleIncomingMessage(topic, message)
    }

    handleIncomingMessage(topic: string, message: any): void {
        console.log('Topic : ', topic)
        if (RpcTopicHandler[topic]) {
            console.log(`Received ${topic} : `, message)
            RpcTopicHandler[topic](message)
        } else {
            console.warn('Unknown event type received :', topic)
        }
    }

    getId(): string {
        return getAgentId()
    }
}
