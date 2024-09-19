import { IncomingMessage } from 'http'
import {
    checkIfAgentExistsInDB,
    fetchAgentConfiguration,
    updateLastActiveTimestamp,
} from '../repository/agent_manager_repository'
import { WsRpcServer } from '../lib/WsRpcServer'
import { RpcV1 } from 'libcardano/network/Rpc'
import { kuber } from './kuber_service'
import { saveTriggerHistory, TriggerType } from '../repository/trigger_history_repository'
import { ManagerWalletService } from './ManagerWallet'
import { Server } from 'ws'
import { metaDataService } from './Metadata_service'

export interface ILog {
    function_name: string
    message: string
    txHash?: string
    triggerType: TriggerType
    trigger: boolean
    success: boolean
    instanceIndex: number
}

export class AgentManagerRPC extends WsRpcServer {
    managerWallet: ManagerWalletService
    constructor(server: Server, managerWallet: ManagerWalletService) {
        super(server)
        this.managerWallet = managerWallet
    }

    protected async validateConnection(req: IncomingMessage): Promise<string> {
        const agentId = req.url?.slice(1)
        console.log('new connection from', req.socket.remoteAddress)

        if (agentId) {
            const exists = await checkIfAgentExistsInDB(agentId)
            if (exists) {
                return agentId
            } else {
                throw Error(`Agent with id ${agentId} doesn't exist`)
            }
        } else {
            throw Error('Invalid websocket connection')
        }
    }

    protected handleMethodCall(connection_id: string, method: string, args: any[]): any {
        console.log('Method call from  client', connection_id, method, args)
        if (method == 'buildTx') {
            const [body, submit] = args
            return kuber.buildTx(body, submit)
        } else if (method == 'logEvent') {
            const params: ILog = args[0]
            const txHash = params.txHash ? params.txHash : ''
            saveTriggerHistory(
                connection_id,
                params.function_name,
                params.trigger,
                params.success,
                params.message,
                params.triggerType,
                txHash,
                params.instanceIndex
            ).catch((err) => console.error('SaveTriggerHistory : ', err))
        } else if (method === 'loadFunds') {
            const [address, amount] = args
            return this.managerWallet.transferWalletFunds(address, amount)
        } else if (method === 'getFaucetBalance') {
            const [address] = args
            return kuber.getBalance(address).then((data) => {
                return data.reduce((totalVal: number, item: any) => totalVal + item.value.lovelace, 0) / 10 ** 6
            })
        } else if (method === 'saveMetadata') {
            const [content] = args
            return metaDataService.saveMetadata(content)
        } else {
            throw new Error('No such method exists')
        }
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
        const addressApiUrl = `${process.env.API_SERVER}/api/agent/${client.getId()}/keys`
        const agentKeysPromise = fetch(addressApiUrl)
            .then((response) => response.json())
            .then((data) => client.emit('agent_keys', data))
            .catch((error) => {
                throw error
            })
        const agentConfigsPromise = fetchAgentConfiguration(client.getId())
            .then((config) => {
                client.emit('initial_config', config)
            })
            .catch((error) => {
                throw error
            })
        Promise.all([agentKeysPromise, agentConfigsPromise]).catch((err: Error) => {
            console.error('AgentManagerRPC.onReady Error:', err)
            this.disconnect(client.getId(), err.message)
        })
    }
}
