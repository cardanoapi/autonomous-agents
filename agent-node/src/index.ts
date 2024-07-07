import WebSocket, {RawData} from 'ws'
import { setInterval } from 'timers'

import { configDotenv } from 'dotenv'
import {RpcV1} from "libcardano/network/Rpc";
import {Pipe} from "libcardano/network/event";
import {CborDuplex} from "libcardano/network/ouroboros";

configDotenv()
// Define the WebSocket URL and agent ID
const wsUrl = process.env.WS_URL || 'ws://localhost:3001' // Use WS_URL if provided, otherwise use default
const agentId = process.env.AGENT_ID || '' // Retrieve agent ID from environment variable
// Check if agent ID is provided
if (!agentId) {
    console.error('Agent ID is required as an argument')
    process.exit(1)
}

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 3
let isReconnecting = false

class AgentRpc extends  RpcV1{
    handleMethodCall(method: string, args: any[]): void {
        console.log("Server called method",method,args)
    }

    onEvent(topic: string, message: any): void {
        console.log("event received",topic,message)
    }

    getId(): string {
        return agentId;
    }
}
export class WsClientPipe extends  Pipe<any,any> {
    ws: WebSocket

    constructor(ws: WebSocket) {
        super()
        this.ws = ws
        ws.on('message', (message: RawData) => {
            this.emit('data', message)
        })
        ws.on('close',  (...args) => {
            this.emit('close',...args)
        })
        ws.on('error', (...args:any) => {
            this.emit('error',...args)
        })
    }

    write(chunk: any, cb?: ((error?: Error | undefined) => void) | undefined): boolean {
        this.ws.send(chunk, {binary: true}, cb,)
        return true
    }

    terminate(code: number, message: string) {
        this.ws.close(code, message)

    }
}

function connectToManagerWebSocket() {
    let interval: NodeJS.Timeout
    // Create a new WebSocket client connection
    ws = new WebSocket(`${wsUrl}/${agentId}`)
    let clientPipe=new WsClientPipe(ws)
    let rpcChannel=new AgentRpc(new CborDuplex(clientPipe));
    // Event listener for the connection opening
    ws.on('open', () => {
        rpcChannel.emit("hello","I am connected")
        console.log('Connected to the server.')
        reconnectAttempts = 0
        isReconnecting = false
        // Send a "Ping" message to the server every 10 seconds
        interval = setInterval(() => {
            ws?.send('Ping')
        }, 10000)
    })

    // Event listener for the connection closing
    ws.on('close', (code, reason) => {
        if (code === 1000 || code === 1008) {
            clearInterval(interval)
            console.log(
                `Disconnected from the server (code: ${code}, reason: ${reason}).`
            )
        } else {
            attemptReconnect()
            clearInterval(interval)
            console.log(
                `Disconnected from the server (code: ${code}, reason: ${reason}).`
            )
        }
    })

    // Event listener for any errors
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
        }, 10000) // Wait 10 seconds before attempting to reconnect
    } else {
        console.error('Max reconnect attempts reached. Exiting application.')
        process.exit(1) // Exit the application after max attempts
    }
}

export const sendDataToWebSocket: typeof WebSocket.prototype.send = (
    action
) => {
    ws?.send(action)
}

connectToManagerWebSocket()
