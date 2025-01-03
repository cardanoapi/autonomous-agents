import WebSocket from 'ws'

import { configDotenv } from 'dotenv'
import { CborDuplex } from 'libcardano/network/ouroboros'
import { cborxBackend } from 'libcardano/lib/cbor'
import { WsClientPipe } from './service/WsClientPipe'
import { AgentRpc } from './service/AgentRpc'
import { ManagerInterface } from './service/ManagerInterfaceService'
import { TxListener } from './executor/TxListener'
import { RpcTopicHandler } from './service/RpcTopicHandler'
import { ScheduledTask } from 'node-cron'
import { globalRootKeyBuffer, globalState } from './constants/global'
import { AgentRunner } from './executor/AgentRunner'
import { decodeBase64string } from './utils/base64converter'
import { validateToken } from './utils/validator'
import { getHandlers } from './executor/AgentFunctions'

configDotenv()
let wsUrl: string = process.env.WS_URL as string
let token: string = process.env.TOKEN as string
if (token) {
    token = decodeBase64string(token)
    console.log('Token:', token)
    const errMsg = validateToken(token)
    if (errMsg) {
        console.error(errMsg)
        process.exit(1)
    }
} else {
    console.error('Token is required as an argument')
    process.exit(1)
}
if (!wsUrl) {
    const network = token.split('_')[0]

    if (network && process.env.MANAGER_BASE_DOMAIN) {
        // This is set in docker file
        wsUrl = `wss://${network.toLowerCase()}.${process.env.MANAGER_BASE_DOMAIN}`
    } else {
        wsUrl = 'ws://localhost:3001'
    }
}
const agentSecret = token.split('_')[1]

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 2
let isReconnecting = false
let hasConnectedBefore = false

getHandlers()

function connectToManagerWebSocket() {
    console.log('Initiating connection to manager at:', wsUrl)
    let interval: NodeJS.Timeout | number
    const scheduledTasks: ScheduledTask[] = []
    ws = new WebSocket(`${wsUrl}/${agentSecret}`)
    const clientPipe = new WsClientPipe(ws)
    const rpcChannel = new AgentRpc(new CborDuplex(clientPipe, cborxBackend(true)))
    const managerInterface = new ManagerInterface(rpcChannel)
    const txListener = new TxListener()

    const agentRunners: Array<AgentRunner> = []

    rpcChannel.on('methodCall', (method, args) => {
        agentRunners.forEach((runner, index) => {
            runner.invokeFunction('MANUAL', index, method, ...args)
        })
    })

    const topicHandler = new RpcTopicHandler(managerInterface, txListener)
    rpcChannel.on('event', (topic, message) => {
        if (topic == 'instance_count') {
            globalRootKeyBuffer.value = message.rootKeyBuffer
            globalState.agentName = message.agentName
            Array(message.instanceCount)
                .fill('')
                .forEach(async (item, index) => {
                    const runner = new AgentRunner(managerInterface, txListener)
                    await runner.remakeContext(index)
                    agentRunners.push(runner)
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
        console.log(`Disconnected from the server (code: ${code}, reason: ${reason}).`)
    })

    ws.on('error', (err: any) => {
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
                if (reconnectAttempts <= maxReconnectAttempts) {
                    console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`)
                }
            }, 10000)
            maxReconnectAttempts >= reconnectAttempts && console.log('Waiting for 10 seconds before reconnecting')
        } else {
            console.error('Max reconnect attempts reached. Exiting application.')
            process.exit(1)
        }
    }
}

connectToManagerWebSocket()
