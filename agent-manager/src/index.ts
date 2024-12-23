
process.env.ELASTIC_APM_SERVICE_NAME='autonomous-agents-manager'
process.env.ELASTIC_APM_ENVIRONMENT='local'
import * as dotenv from 'dotenv'
dotenv.config()
import * as agent from 'elastic-apm-node/start'; agent;
import { startTransaction } from "./config/tracer";
// agent.start({
//     serviceName: 'autonomous-agents-manager',
//     environment: 'local',
//     // Use if APM Server requires a token
//
//     // Use if APM Server uses API keys for authentication
//     apiKey: process.env.ELASTIC_APM_API_KEY,
//
//     // Set custom APM Server URL (default: http://127.0.0.1:8200)
//     serverUrl: process.env.ELASTIC_APM_SERVER_URL,
// })
import express from 'express'
import { WebSocket } from 'ws'
import { initKafkaConsumers } from './service/Listeners/KafkaMessageConsumer'
import { AgentManagerRPC } from './service/Manager/AgentManagerRPC'
import { createBlockchainInstance } from './service/Listeners/BlockchainService'
import { ManagerWalletService } from './service/Manager/ManagerWallet'
import { TxListener } from './service/Listeners/TxListener'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import environments from "./config/environments";
const app = express()
const port = environments.serverPort

const server = app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`)

    const blockchain = createBlockchainInstance()
    const wss = new WebSocket.Server({ server })
    const txListener = new TxListener()
    const managerWallet = new ManagerWalletService(txListener)
    const manager = new AgentManagerRPC(wss, managerWallet)

    setInterval(() => {
        console.log('Connection count:', manager.server.clients.size)
    }, 10000)

    blockchain.start()
    blockchain.blockChain.on('extendBlock', (block) => {
        const transaction = startTransaction('extendBlock','node',)
        console.log(
            `[Blockchain] RollForward blockNo=${block.blockNo} hash=${block.headerHash.toString('hex')} slot=${block.slotNo}`
        )
        const transactions = parseRawBlockBody(block.body)
        txListener.onBlock({ ...block, body: transactions })
        manager.broadcast('extend_block', block)
        transaction.end('success')
    })
    await initKafkaConsumers(manager)
})
server.on('error', (e) => {
    console.error('Server error:', e)
    process.exit(1)
})
