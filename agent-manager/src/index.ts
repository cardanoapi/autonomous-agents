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
const port = environments.port

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
        console.log(
            `[Blockchain] RollForward blockNo=${block.blockNo} hash=${block.headerHash.toString('hex')} slot=${block.slotNo}`
        )
        const transactions = parseRawBlockBody(block.body)
        txListener.onBlock({ ...block, body: transactions })
        manager.broadcast('extend_block', block)
    })
    await initKafkaConsumers(manager)
})
server.on('error', (e) => {
    console.error('Server error:', e)
    process.exit(1)
})
