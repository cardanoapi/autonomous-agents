import express from 'express'
import { WebSocket } from 'ws'
import { initKafkaConsumers } from './service/kafka_message_consumer'
import { AgentManagerRPC } from './service/AgentManagerRPC'
import { createBlockchainInstance } from './service/BlockchainService'

const app = express()
const port = 3001

const server = app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`)

    const blockchain = createBlockchainInstance()

    const wss = new WebSocket.Server({ server })
    const manager = new AgentManagerRPC(wss)

    setInterval(() => {
        console.log('Connection count:', manager.server.clients.size)
    }, 10000)

    blockchain.on('extendBlock', (block) => {
        console.log(
            `[Blockchain] RollForward blockNo=${block.blockNo} hash=${block.headerHash.toString('hex')} slot=${block.slotNo}`
        )
        manager.broadcast('extend_block', block)
    })
    blockchain.on()

    await initKafkaConsumers(manager)
})
server.on('error', (e) => {
    console.error('Server error:', e)
    process.exit(1)
})
