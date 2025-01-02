import { IncomingMessage } from 'http'
import {
    fetchAgentConfiguration,
    getAgentIdBySecret,
    updateLastActiveTimestamp,
} from '../../repository/agent_manager_repository'
import { WsRpcServer } from '../../lib/WsRpcServer'
import { RpcV1 } from 'libcardano/network/Rpc'
import { TriggerType } from '../../repository/trigger_history_repository'
import { ManagerWalletService } from './ManagerWallet'
import { Server } from 'ws'
import { generateRootKey } from '../../utils/cardano'
import { RPCTopicHandler } from '../RPCTopicHandler'

export interface ILog {
    function_name: string
    message: string
    txHash?: string
    triggerType: TriggerType
    trigger: boolean
    success: boolean
    instanceIndex: number
    internal?: string
    parameters?: string
    result?: string
}

export class AgentManagerRPC extends WsRpcServer {
    managerWallet: ManagerWalletService
    rpcTopicHandler: RPCTopicHandler

    constructor(server: Server, managerWallet: ManagerWalletService) {
        super(server)
        this.managerWallet = managerWallet
        this.rpcTopicHandler = new RPCTopicHandler(managerWallet)
    }

    protected async validateConnection(req: IncomingMessage): Promise<string> {
        const agentSecretKey = req.url?.slice(1)
        console.log('new connection from', req.socket.remoteAddress)

        if (agentSecretKey) {
            const exists = await getAgentIdBySecret(Buffer.from(agentSecretKey, 'base64'))
            if (exists) {
                return exists
            } else {
                throw Error(`Agent with secret_key ${agentSecretKey} doesn't exist`)
            }
        } else {
            throw Error('Invalid websocket connection')
        }
    }

    protected async handleMethodCall(connection_id: string, method: string, args: any[]) {
        console.log('Method call from  client', connection_id, method, args)
        return this.rpcTopicHandler.handleEvent(method, connection_id, args)
    }

    protected async validateEventBroadcast(connection_id: string, topic: string, message: any): Promise<boolean> {
        // TODO: handle the event emitted
        console.log('Event from client', connection_id, topic, message)
        if (topic === 'active_connection') {
            await updateLastActiveTimestamp(connection_id)
        }
        // we don't forward this event to other connections.
        return Promise.resolve(false)
    }

    protected onReady(client: RpcV1): void {
        const agentConfigsPromise = fetchAgentConfiguration(client.getId())
            .then(async (config) => {
                if (!config) {
                    this.disconnect(client.getId(), 'Invalid instance configuration')
                    return
                }

                const { instanceCount, agentIndex, agentName } = config
                const rootKeyBuffer = await generateRootKey(agentIndex || 0)
                client.emit('instance_count', { instanceCount, rootKeyBuffer, agentName })

                client.emit('initial_config', config)
            })
            .catch((error) => {
                throw error
            })
        Promise.all([agentConfigsPromise]).catch((err: Error) => {
            console.error('AgentManagerRPC onReady Error:', err)
            this.disconnect(client.getId(), err.message)
        })
    }
}
