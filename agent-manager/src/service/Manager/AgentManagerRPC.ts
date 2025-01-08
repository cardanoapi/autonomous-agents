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
import { apmConfig, captureError, startTransaction } from '../../config/tracer'

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
let _tx: any = undefined
export class AgentManagerRPC extends WsRpcServer {
    managerWallet: ManagerWalletService
    rpcTopicHandler: RPCTopicHandler

    constructor(server: Server, managerWallet: ManagerWalletService) {
        super(server)
        this.managerWallet = managerWallet
        this.rpcTopicHandler = new RPCTopicHandler(managerWallet)
    }

    protected async validateConnection(req: IncomingMessage): Promise<string> {
        const tx = (_tx = startTransaction('connect', 'request'))
        const agentSecretKey = req.url?.slice(1)
        console.log('new connection from', req.socket.remoteAddress)
        tx.addLabels({
            request_ip: req.socket.remoteAddress, // Request IP address (note: underscore instead of dot)
        })

        // Loop through all request headers and add them as labels
        for (const [headerKey, headerValue] of Object.entries(req.headers)) {
            // Replace dots in header keys with underscores
            const labelKey = `request_headers_${headerKey.replace(/\./g, '_')}`

            // Make sure the header value is a string and add as a label
            if (typeof headerValue === 'string') {
                tx.addLabels({ [labelKey]: headerValue })
            } else {
                // If the value is not a string (like an array), we can stringify it
                tx.addLabels({ [labelKey]: JSON.stringify(headerValue) })
            }
        }

        if (agentSecretKey) {
            const exists = await getAgentIdBySecret(Buffer.from(agentSecretKey, 'base64'))
            if (exists) {
                return exists
            } else {
                tx.setOutcome('failure')
                tx.end(`Agent with secret_key ${agentSecretKey} doesn't exist`)
                throw Error(`Agent with secret_key ${agentSecretKey} doesn't exist`)
            }
        } else {
            tx.setOutcome('failure')
            tx.end(`Invalid websocket connection`)
            throw Error('Invalid websocket connection')
        }
    }

    protected async handleMethodCall(connection_id: string, method: string, args: any[]) {
        console.log('Method call from  client', connection_id, method, args)
        const tx = startTransaction('RPC ' + method, 'request')
        const labels: Record<string, string> = {
            connectionId: connection_id,
            method: method,
        }
        args.map((x, index) => {
            labels['arg' + index] = x
        })
        tx.addLabels(labels)
        const _tx = tx as any
        _tx.context = { connectionId: connection_id }

        return this.rpcTopicHandler
            .handleEvent(method, connection_id, args)
            .then((v) => {
                tx.setOutcome('success')
                tx.addLabels({ result: v })
                return v
            })
            .catch((e) => {
                captureError(e)
                throw e
            })
            .finally(() => tx.end())
    }

    protected async validateEventBroadcast(connection_id: string, topic: string, message: any): Promise<boolean> {
        console.debug('message : ', message)
        // TODO: handle the event emitted
        if (topic === 'active_connection') {
            await updateLastActiveTimestamp(connection_id)
        }
        // we don't forward this event to other connections.
        return Promise.resolve(false)
    }

    protected onReady(client: RpcV1): void {
        const thisTx = _tx
        _tx = undefined
        const agentConfigsPromise = fetchAgentConfiguration(client.getId())
            .then(async (config) => {
                if (!config) {
                    this.disconnect(client.getId(), 'Invalid instance configuration')
                    return
                }

                const { instanceCount, agentIndex, agentName } = config
                const rootKeyBuffer = await generateRootKey(agentIndex || 0)
                client.emit('instance_count', { instanceCount, rootKeyBuffer, agentName })
                if (apmConfig) {
                    ;(config as any).apm = apmConfig
                }

                client.emit('initial_config', config)
            })
            .catch((error) => {
                throw error
            })
        Promise.all([agentConfigsPromise])
            .catch((err: Error) => {
                console.error('AgentManagerRPC onReady Error:', err)
                this.disconnect(client.getId(), err.message)
            })
            .then(() => {
                if (thisTx) {
                    thisTx.setOutcome('success')
                }
            })
            .catch((e) => {
                captureError(e)
            })
            .finally(() => {
                if (thisTx) {
                    thisTx.end()
                }
            })
    }
}
