import WebSocket from 'ws'

import { configDotenv } from 'dotenv'
import { CborDuplex } from 'libcardano/network/ouroboros'
import { cborxBackend } from 'libcardano/lib/cbor'
import { WsClientPipe } from './service/WsClientPipe'
import { AgentRpc } from './service/AgentRpc'
import { ManagerInterface } from './service/ManagerInterfaceService'

configDotenv()
const wsUrl = process.env.WS_URL || 'ws://localhost:3001'
const agentId = process.env.AGENT_ID || ''
if (!agentId) {
    console.error('Agent ID is required as an argument')
    process.exit(1)
}

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 3
let isReconnecting = false

function connectToManagerWebSocket() {
    let interval: NodeJS.Timeout | number
    ws = new WebSocket(`${wsUrl}/${agentId}`)
    const clientPipe = new WsClientPipe(ws)
    const rpcChannel = new AgentRpc(
        new CborDuplex(clientPipe, cborxBackend(true))
    )
    ManagerInterface.setInstance(rpcChannel)

    ws.on('open', () => {
        interval = setInterval(() => {
            rpcChannel.emit('active_connection', 'Ping')
        }, 10000)
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
    if (maxReconnectAttempts >= reconnectAttempts) {
        if (isReconnecting) {
            return
        }
        isReconnecting = true
        reconnectAttempts++
        console.log(
            `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`
        )
        console.log('Waiting for 10 seconds before reconnecting')
        setTimeout(() => {
            connectToManagerWebSocket()
            isReconnecting = false
        }, 10000)
    } else {
        console.error('Max reconnect attempts reached. Exiting application.')
        process.exit(1)
    }
}

connectToManagerWebSocket()
