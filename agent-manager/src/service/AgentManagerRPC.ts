import { IncomingMessage } from 'http'
import {
    checkIfAgentExistsInDB,
    fetchAgentConfiguration,
    updateLastActiveTimestamp,
} from '../repository/agent_manager_repository'
import { WsRpcServer } from '../lib/WsRpcServer'
import { RpcV1 } from 'libcardano/network/Rpc'
import { kuber } from './kuber_service'
import { saveTriggerHistory } from '../repository/trigger_history_repository'

export class AgentManagerRPC extends WsRpcServer {
    protected async validateConnection(req: IncomingMessage): Promise<string> {
        const agentId = req.url?.slice(1)
        console.log('new connection from', req.socket.remoteAddress)

        if (agentId) {
            const exists = await checkIfAgentExistsInDB(agentId)
            if (exists) {
                return agentId
            } else {
                throw Error('Agent is not found ' + agentId)
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
            const params = args[0]
            const txHash = params.txHash ? params.txHash : ''
            saveTriggerHistory(
                connection_id,
                params.function_name,
                params.trigger,
                params.success,
                params.message,
                params.triggerType,
                txHash
            ).catch((err) => console.error('SaveTriggerHistory : ', err))
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
            .catch((err) => console.error(err))
        const agentConfigsPromise = fetchAgentConfiguration(client.getId()).then((config) => {
            client.emit('initial_config', config)
        })
        Promise.all([agentKeysPromise, agentConfigsPromise]).catch((err: Error) => {
            console.error(err)
            this.disconnect(client.getId(), err.message)
        })
    }
}
