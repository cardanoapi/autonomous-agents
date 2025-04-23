process.env.ELASTIC_APM_LOG_LEVEL = 'warning'
process.env.ELASTIC_APM_SERVICE_NAME = 'autonomous-agents-manager'
process.env.ELASTIC_APM_ENVIRONMENT = process.env.ELASTIC_APM_ENVIRONMENT || 'local'
import * as dotenv from 'dotenv'
dotenv.config()
// import * as agent from 'elastic-apm-node/start'
// agent
import { startTransaction } from './config/tracer'
import { cardanoNodeStatus } from './service/healthCheck/cardanoNode'
import healthCheck from './controller/health'
import blockfrostHealth from './controller/blockfrostHealth'
import express from 'express'
import { WebSocket } from 'ws'
import { initKafkaConsumers } from './service/Listeners/KafkaMessageConsumer'
import { AgentManagerRPC } from './service/Manager/AgentManagerRPC'
import { createBlockchainInstance } from './service/Listeners/BlockchainService'
import { ManagerWalletService } from './service/Manager/ManagerWallet'
import { TxListener } from './service/Listeners/TxListener'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import environments from './config/environments'
const app = express()
const port = environments.serverPort

app.use('/api/health', healthCheck)
app.use('/api/blockfrost/health', blockfrostHealth)

const server = app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`)

    const blockchain = createBlockchainInstance()
    const wss = new WebSocket.Server({ server })
    const txListener = new TxListener()
    const managerWallet = new ManagerWalletService(txListener)
    const manager = new AgentManagerRPC(wss, managerWallet)

    blockchain.start()
    blockchain.blockChain.on('extendBlock', (block) => {
        const transaction = startTransaction('extendBlock', 'node')
        cardanoNodeStatus.onBlockTimeStamp(Date.now(), block)

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
