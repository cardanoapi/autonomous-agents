import {
    checkIfAgentExistsInDB,
    fetchAgentConfiguration,
    updateLastActiveTimestamp
} from "./repository/agent_manager_repository";
import manager from "./service/agent_manager_service";
import cors from 'cors';


import {WebSocket} from "ws";
import {kafka_event} from "./service/kafka_message_consumer";
import {
    handleTransaction,
    stopFunctionsWhenAgentDisconnects
} from "./service/transaction_service";
import express from "express";
import setupSwagger from "./swagger";
import router from "./routes";


const app = express();
const port = 3001;

app.use(express.json());

// Setup Swagger
setupSwagger(app);

//cors
// CORS configuration allowing multiple origins
const allowedOrigins = ['http://localhost:3000', 'http://agents.cardanoapi.io/', '*'];

app.use(cors({
  origin: allowedOrigins, // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods// Allow only specified HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow only specified headers
}));
// Setup routes
app.use(router);


const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});




const wss = new WebSocket.Server({ server });
wss.on('connection', async function connection(ws, req) {
    const agentId = req.url?.slice(1)
    if (!agentId) {
        console.log('Agent ID is not provided in the request headers as expected.',agentId);
        ws.close(1008, `Agent ID: ${agentId} is not provided in the request headers as expected. `);
      }
   if (typeof agentId === 'string') {
    // Handle agentId as a valid string
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
             console.log(`Agent: ${agentId} doesnot exist `);
              ws.close(1008, `Agent: ${agentId} doesnot exist `);
        }

        ws.on('message', async function incoming(message) {

                console.log(`Received message from agent ${agentId}: ${message}`);
            await handleTransaction(message,agentId);
            // manager.sendToWebSocket(agentId, { message: 'cardano-node-blocks' });
            ws.send(JSON.stringify({
                message: "Pong received from Server",
                timestamp: new Date().toISOString()
            }));
            await updateLastActiveTimestamp(agentId);
        });

        ws.on('close', function close() {
            console.log(`Agent disconnected: ${agentId}`);
            stopFunctionsWhenAgentDisconnects(agentId)
            manager.disconnectWebSocket(agentId);
        });
    } else {
        // Handle case when agentId is not provided or not a string
        console.log('Agent id not valid',agentId);
        ws.close(1008, `Agent: ${agentId} doesnot exist`);
        return;
    }
});
