 import WebSocket from 'ws';
import { setInterval } from 'timers';
import { handleIncomingMessage } from './client';

// Define the WebSocket URL and agent ID
const wsUrl = 'ws://localhost:3030'; // Update the URL as needed
const agentId = process.argv[2]; // Provide the agent ID as a command-line argument

// Check if agent ID is provided
if (!agentId) {
    console.error('Agent ID is required as a command-line argument.');
    process.exit(1);
}

// Create a new WebSocket client connection
const ws = new WebSocket(wsUrl, {
    headers: {
        'agent_id': agentId,
    },
});

// Event listener for the connection opening
ws.on('open', () => {
    console.log('Connected to the server.');

    // Send a "Ping" message to the server every 10 seconds
    setInterval(() => {
        ws.send('Ping');
    }, 10000);zz
});

// Event listener for incoming messages
ws.on('message', (data) => {
    handleIncomingMessage(data);
});

// Event listener for the connection closing
ws.on('close', (code, reason) => {
    console.log(`Disconnected from the server (code: ${code}, reason: ${reason}).`);
});

// Event listener for any errors
ws.on('error', (error) => {
    console.error('WebSocket error');
});
