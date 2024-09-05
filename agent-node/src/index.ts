import WebSocket from 'ws'

import { configDotenv } from 'dotenv'
import { CborDuplex } from 'libcardano/network/ouroboros'
import { cborxBackend } from 'libcardano/lib/cbor'
import { WsClientPipe } from './service/WsClientPipe'
import { AgentRpc } from './service/AgentRpc'
import { ManagerInterface } from './service/ManagerInterfaceService'
import { Executor } from './executor/Executor'
import { TxListener } from './executor/TxListener'
import { RpcTopicHandler } from './service/RpcTopicHandler'
import { saveTxLog } from './utils/agent'
import { TriggerType } from './service/triggerService'
import { AgentWalletDetails } from './types/types'
import { ScheduledTask } from 'node-cron'

configDotenv()
const wsUrl = process.env.WS_URL || 'ws://localhost:3001'
const agentId = process.env.AGENT_ID || ''
if (!agentId) {
    console.error('Agent ID is required as an argument')
    process.exit(1)
}

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 2
let isReconnecting = false
let hasConnectedBefore = false

export class AgentRunner {
    executor: Executor
    managerInterface: ManagerInterface
    constructor(managerInterface: ManagerInterface, txListener: TxListener) {
        this.managerInterface = managerInterface
        this.executor = new Executor(null, managerInterface, txListener)
    }

    invokeFunction(triggerType: TriggerType, method: string, ...args: any) {
        this.executor.invokeFunction(method, ...args).then((result) => {
            saveTxLog(result, this.managerInterface, triggerType)
        })
    }

    remakeContext(agent_wallet: AgentWalletDetails) {
        this.executor.remakeContext(agent_wallet)
    }
}

function connectToManagerWebSocket() {
    let interval: NodeJS.Timeout | number
    let scheduledTasks: ScheduledTask[] = []
    ws = new WebSocket(`${wsUrl}/${agentId}`)
    const clientPipe = new WsClientPipe(ws)
    const rpcChannel = new AgentRpc(
        new CborDuplex(clientPipe, cborxBackend(true))
    )
    const managerInterface = new ManagerInterface(rpcChannel)
    const txListener = new TxListener()

    let agentRunners: Array<AgentRunner> = []

    rpcChannel.on('methodCall', (method, args) => {
        console.log('RUnners are: ', agentRunners)
        agentRunners.forEach((runner) => {
            runner.invokeFunction('MANUAL', method, ...args)
        })
    })

    const topicHandler = new RpcTopicHandler(managerInterface, txListener)
    rpcChannel.on('event', (topic, message) => {
        if (topic == 'instance_count') {
            Array(message)
                .fill('')
                .forEach((item, index) => {
                    agentRunners.push(
                        new AgentRunner(managerInterface, txListener)
                    )
                })
        } else if (topic == 'agent_keys') {
            agentRunners.forEach((runner) => {
                runner.remakeContext(message)
            })
        }
        topicHandler.handleEvent(topic, message, agentRunners, scheduledTasks)
    })

    ws.on('open', () => {
        hasConnectedBefore = true
        interval = setInterval(() => {
            rpcChannel.emit('active_connection', 'Ping')
        }, 5000)
        rpcChannel.emit('hello', 'I am connected')
    })

    ws.on('close', (code, reason) => {
        if (code === 1000 || code === 1008) {
            clearInterval(interval)
        } else {
            attemptReconnect()
            clearInterval(interval)
        }
        console.log(
            `Disconnected from the server (code: ${code}, reason: ${reason}).`
        )
    })

    ws.on('error', (er) => {
        console.error('WebSocket error', er)
        attemptReconnect()
        clearInterval(interval)
    })
}

function attemptReconnect() {
    if (hasConnectedBefore) {
        console.log('Waiting for 10 seconds before reconnecting again')
        setTimeout(() => {
            connectToManagerWebSocket()
            isReconnecting = false
        }, 10000)
    } else {
        if (maxReconnectAttempts >= reconnectAttempts) {
            if (isReconnecting) {
                return
            }
            isReconnecting = true
            reconnectAttempts++
            setTimeout(() => {
                connectToManagerWebSocket()
                isReconnecting = false
                console.log(
                    `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`
                )
            }, 10000)
            maxReconnectAttempts >= reconnectAttempts &&
                console.log('Waiting for 10 seconds before reconnecting')
        } else {
            console.error(
                'Max reconnect attempts reached. Exiting application.'
            )
            process.exit(1)
        }
    }
}

connectToManagerWebSocket()
