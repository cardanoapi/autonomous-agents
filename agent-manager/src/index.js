"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agent_manager_repository_1 = require("./repository/agent_manager_repository");
const agent_manager_service_1 = __importDefault(require("./service/agent_manager_service"));
const ws_1 = require("ws");
const kafka_message_consumer_1 = require("./service/kafka_message_consumer");
const transaction_service_1 = require("./service/transaction_service");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3001;
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
const wss = new ws_1.WebSocket.Server({ server });
wss.on('connection', async function connection(ws, req) {
    const agentId = req.url?.slice(1);
    if (!agentId) {
        console.log('Agent ID is not provided in the request headers as expected.', agentId);
        ws.close(1008, `Agent ID: ${agentId} is not provided in the request headers as expected. `);
    }
    if (typeof agentId === 'string') {
        // Handle agentId as a valid string
        console.log(`Agent connected: ${agentId}`);
        const agentExists = await (0, agent_manager_repository_1.checkIfAgentExistsInDB)(agentId);
        if (agentExists) {
            await (0, kafka_message_consumer_1.kafka_event)();
            await agent_manager_service_1.default.removePreviousAgentConnectionIfExists(agentId);
            await agent_manager_service_1.default.connectWebSocket(agentId, ws);
            const { instanceCount, configurations } = await (0, agent_manager_repository_1.fetchAgentConfiguration)(agentId);
            ws.send(JSON.stringify({
                message: "initial",
                instance_count: Number(instanceCount),
                configurations
            }));
        }
        else {
            console.log(`Agent: ${agentId} doesnot exist `);
            ws.close(1008, `Agent: ${agentId} doesnot exist `);
        }
        ws.on('message', async function incoming(message) {
            console.log(`Received message from agent ${agentId}: ${message}`);
            await (0, transaction_service_1.handleTransaction)(message, agentId);
            agent_manager_service_1.default.sendToWebSocket(agentId, { message: 'cardano-node-blocks' });
            ws.send(JSON.stringify({
                message: "Pong received from Server",
                timestamp: new Date().toISOString()
            }));
            await (0, agent_manager_repository_1.updateLastActiveTimestamp)(agentId);
        });
        ws.on('close', function close() {
            console.log(`Agent disconnected: ${agentId}`);
            (0, transaction_service_1.stopFunctionsWhenAgentDisconnects)(agentId);
            agent_manager_service_1.default.disconnectWebSocket(agentId);
        });
    }
    else {
        // Handle case when agentId is not provided or not a string
        console.log('Agent id not valid', agentId);
        ws.close(1008, `Agent: ${agentId} doesnot exist`);
        return;
    }
});
