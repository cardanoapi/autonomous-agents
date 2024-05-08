import {
    checkIfAgentExistsInDB,
    fetchAgentConfiguration,
    updateLastActiveTimestamp
} from "./repository/agent_manager_repository";
import manager from "./service/agent_manager_service";


import {WebSocket} from "ws";
import {kafka_event} from "./service/kafka_message_consumer";


const wss = new WebSocket.Server({ port: 3030 });
wss.on('connection', async function connection(ws, req) {
    const agentId = req.headers['agent_id'];
    if (typeof agentId === 'string') {
        console.log(`Agent connected: ${agentId}`);

        const agentExists = await checkIfAgentExistsInDB(agentId);
        if (agentExists) {
            await kafka_event()
            await manager.removePreviousAgentConnectionIfExists(agentId)
            await manager.connectWebSocket(agentId, ws);
            const {instanceCount, configurations} = await fetchAgentConfiguration(agentId);
            ws.send(JSON.stringify({
                message: "initial",
                instance_count: Number(instanceCount),
                configurations
            }));
        } else {
            ws.close(1008, 'Policy Violation');
        }

        ws.on('message', async function incoming(message) {

            console.log(`Received message from agent ${agentId}: ${message}`);
            // manager.sendToWebSocket(agentId, { message: 'cardano-node-blocks' });
            ws.send(JSON.stringify({
                message: "Pong received from Server",
                timestamp: new Date().toISOString()
            }));
            await updateLastActiveTimestamp(agentId);
        });

        ws.on('close', function close() {
            console.log(`Agent disconnected: ${agentId}`);
            manager.disconnectWebSocket(agentId);
        });
    } else {
        // Handle the case when agentId is undefined
        console.error('Agent ID is not provided in the request headers.');
        ws.close(1008, 'Policy Violation');
    }
});




