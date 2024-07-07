import express from 'express'
import { WebSocket } from 'ws'
import { initKafkaConsumers } from './service/kafka_message_consumer'
import { handleTransaction } from './service/transaction_service'
import {AgentManagerRPC} from "./service/AgentManagerRPC";
import {WebSocketPipe} from "libcardano/network/Peer";
import {createBlockchainInstance} from "./service/BlockchainService";

const app = express()
const port = 3001

const server = app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`)
    await initKafkaConsumers()
})
server.on("error",(e)=>{
    console.error("Server error:",e)
    process.exit(1)
})

const blockchain = createBlockchainInstance()

const wss = new WebSocket.Server({ server })
let manager = new AgentManagerRPC(wss)
setInterval(()=>{
    console.log("Connection count:",manager.server.clients.size)
    manager.broadcast('ping','hello from server')
},10000)

blockchain.on("extendBlock",(block)=>{
    console.log(`[Blockchain] RollForward blockNo=${block.blockNo} hash=${block.headerHash.toString('hex')} slot=${block.slotNo}`)
    manager.broadcast('extendBlock',block)
})
