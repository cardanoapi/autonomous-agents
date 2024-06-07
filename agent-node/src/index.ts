import WebSocket from 'ws'
import { setInterval } from 'timers'
import { handleIncomingMessage } from './client'

// Define the WebSocket URL and agent ID
const wsUrl = process.env.WS_URL || '' // Use WS_URL if provided, otherwise use default
const agentId = process.env.AGENT_ID || '' // Retrieve agent ID from environment variable

// Check if agent ID is provided
if (!agentId) {
    console.error('Agent ID is required as an argument')
    process.exit(1)
}

// Create a new WebSocket client connection
const ws = new WebSocket(`${wsUrl}/${agentId}`)
// Event listener for the connection opening
ws.on('open', () => {
    console.log('Connected to the server.')

    // Send a "Ping" message to the server every 10 seconds
    setInterval(() => {
        ws.send('Ping')
    }, 10000)
})

// Event listener for incoming messages
ws.on('message', (data) => {
    handleIncomingMessage(data)
})

// Event listener for the connection closing
ws.on('close', (code, reason) => {
    console.log(
        `Disconnected from the server (code: ${code}, reason: ${reason}).`
    )
})

// Event listener for any errors
ws.on('error', (er) => {
    console.error('WebSocket error', er)
})

export function sendParamsToWebSocket(action: any) {
    // Check WebSocket connection state

    // Convert parameters to JSON string

    // Send parameters to WebSocket server
    ws.send(action)
}
