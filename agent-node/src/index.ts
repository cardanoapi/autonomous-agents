import WebSocket from 'ws'
import { setInterval } from 'timers'
import { handleIncomingMessage } from './client'

import { configDotenv } from 'dotenv'

configDotenv()
// Define the WebSocket URL and agent ID
const wsUrl = process.env.WS_URL || '' // Use WS_URL if provided, otherwise use default
const agentId = process.env.AGENT_ID || '' // Retrieve agent ID from environment variable
// Check if agent ID is provided
if (!agentId) {
    console.error('Agent ID is required as an argument')
    process.exit(1)
}

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 3

function connectToManagerWebSocket() {
    if (ws !== null) {
        return
    }
    // Create a new WebSocket client connection
    ws = new WebSocket(`${wsUrl}/${agentId}`)
    // Event listener for the connection opening
    ws.on('open', () => {
        console.log('Connected to the server.')
        reconnectAttempts = 0

        // Send a "Ping" message to the server every 10 seconds
        setInterval(() => {
            ws?.send('Ping')
        }, 10000)
    })

    // Event listener for incoming messages
    ws.on('message', (data) => {
        handleIncomingMessage(data)
    })

    // Event listener for the connection closing
    ws.on('close', (code, reason) => {
        attemptReconnect()
        console.log(
            `Disconnected from the server (code: ${code}, reason: ${reason}).`
        )
    })

    // Event listener for any errors
    ws.on('error', (er) => {
        console.error('WebSocket error', er)
        attemptReconnect()
    })
}

function attemptReconnect() {
    if (maxReconnectAttempts >= reconnectAttempts) {
        reconnectAttempts++
        console.log(
            `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`
        )
        console.log('Waiting for 10 seconds before reconnecting')
        setTimeout(() => {
            connectToManagerWebSocket()
        }, 10000) // Wait 10 seconds before attempting to reconnect
    } else {
        console.error('Max reconnect attempts reached. Exiting application.')
        process.exit(1) // Exit the application after max attempts
    }
}

export function sendParamsToWebSocket(action: any) {
    // Check WebSocket connection state

    // Convert parameters to JSON string

    // Send parameters to WebSocket server
    ws?.send(action)
}

connectToManagerWebSocket()
