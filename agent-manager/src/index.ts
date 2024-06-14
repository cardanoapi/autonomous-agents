import {
    checkIfAgentExistsInDB,
    fetchAgentConfiguration,
    updateLastActiveTimestamp,
} from './repository/agent_manager_repository'
import manager from './service/agent_manager_service'

import express from 'express'
import { WebSocket } from 'ws'
import { initKafkaConsumers } from './service/kafka_message_consumer'
import { handleTransaction } from './service/transaction_service'
const app = express()
const port = 3001

const server = app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`)
    await initKafkaConsumers()
})

const wss = new WebSocket.Server({ server })
wss.on('connection', async function connection(ws, req) {
    const agentId = req.url?.slice(1)
    if (!agentId) {
        console.log(
            'Agent ID is not provided in the request headers as expected.',
            agentId
        )
        ws.close(
            1008,
            `Agent ID: ${agentId} is not provided in the request headers as expected. `
        )
    }
    if (typeof agentId === 'string') {
        // Handle agentId as a valid string
        console.log(`Agent connected: ${agentId}`)

        const agentExists = await checkIfAgentExistsInDB(agentId)
        if (agentExists) {
            await manager.removePreviousAgentConnectionIfExists(agentId)
            await manager.webSocketConnected(agentId, ws)
            const { instanceCount, configurations } =
                await fetchAgentConfiguration(agentId)
            ws.send(
                JSON.stringify({
                    message: 'initial',
                    instance_count: Number(instanceCount),
                    configurations,
                })
            )
        } else {
            console.log(`Agent: ${agentId} doesnot exist `)
            ws.close(1008, `Agent: ${agentId} doesnot exist `)
        }

        ws.on('message', async function incoming(message) {
            console.log(`Received message from agent ${agentId}: ${message}`)
            await handleTransaction(message, agentId)
            ws.send(
                JSON.stringify({
                    message: 'Pong received from Server',
                    timestamp: new Date().toISOString(),
                })
            )
            await updateLastActiveTimestamp(agentId)
        })

        ws.on('close', function close() {
            console.log(`Agent disconnected: ${agentId}`)
            manager.disconnectWebSocket(agentId)
        })
    } else {
        // Handle case when agentId is not provided or not a string
        console.log('Agent id not valid', agentId)
        ws.close(1008, `Agent: ${agentId} doesnot exist`)
        return
    }
})
