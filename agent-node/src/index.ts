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
function connectToManagerWebSocket() {
    let interval: NodeJS.Timeout | number
    ws = new WebSocket(`${wsUrl}/${agentId}`)
    const clientPipe = new WsClientPipe(ws)
    const rpcChannel = new AgentRpc(
        new CborDuplex(clientPipe, cborxBackend(true))
    )
    const managerInterface = new ManagerInterface(rpcChannel)
    const txListener = new TxListener()
    const executor = new Executor(null, managerInterface, txListener)

    rpcChannel.on('methodCall', (method, args) => {
        executor.invokeFunction(method, ...args).then((result) => {
            saveTxLog(result, managerInterface, 'MANUAL')
        })
    })
    const topicHandler = new RpcTopicHandler(
        managerInterface,
        txListener,
        executor
    )
    rpcChannel.on('event', (topic, message) => {
        if (topic == 'agent_keys') {
            executor.remakeContext(message)
        }
        topicHandler.handleEvent(topic, message)
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
