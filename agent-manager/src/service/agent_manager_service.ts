import { parseTransaction } from 'libcardano/cardano/ledger-serialization/transaction'
import cbor from 'libcardano/lib/cbor'
import { createInMemoryClientWithPeer } from 'libcardano/src/helper'
import { WebSocket } from 'ws'
import { fetchAgentConfiguration } from '../repository/agent_manager_repository'
import { BlockEvent } from 'libcardano/src/types'
import { InmemoryBlockchain } from 'libcardano/src/InmemoryBlockchain'

const bigIntReplacer = (key: any, value: any) => {
    if (typeof value === 'bigint') {
        return value.toString()
    }
    return value
}
class WebSocketConnectionManager {
    activeConnections: { [key: string]: WebSocket } = {}
    blockchain: InmemoryBlockchain

    constructor() {
        this.blockchain = createInMemoryClientWithPeer(
            process.env['CARDANO_NODE_URL'],
            4,
            'Latest'
        )

        this.blockchain.pipeline('extendBlock', (block, cb) => {
            this.sendNewBlockToActiveAgents(block, cb)
        })
    }

    async webSocketConnected(
        websocketAgentId: string,
        websocket: WebSocket
    ): Promise<void> {
        this.activeConnections[websocketAgentId] = websocket
    }

    async disconnectWebSocket(websocketAgentId: string): Promise<void> {
        // Disconnect WebSocket connection of agent
        const existingWebSocket = this.activeConnections[websocketAgentId]
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId]
            await existingWebSocket.close(1000, 'Connection closed')
        }
    }

    async sendToWebSocket(
        websocketAgentId: string,
        message: any
    ): Promise<void> {
        // Send message to WebSocket connection of agent
        const agent_active = await this.checkIfAgentActive(websocketAgentId)
        if (agent_active) {
            const websocket = this.activeConnections[websocketAgentId]
            if (websocket) {
                try {
                    if (message.message === 'config_updated') {
                        // Fetch updated configuration
                        const { instanceCount, configurations } =
                            await fetchAgentConfiguration(websocketAgentId)
                        const updatedMessage = {
                            message: 'config_updated',
                            instance_count: Number(instanceCount),
                            configurations,
                        }
                        await websocket.send(JSON.stringify(updatedMessage))
                    } else {
                        await websocket.send(JSON.stringify(message))
                    }
                } catch (error) {
                    console.log(
                        `Error sending message to agent ${websocketAgentId}: ${error}`
                    )
                }
            } else {
                console.log(`Agent ${websocketAgentId} is not connected`)
            }
        }
    }

    async checkIfAgentActive(websocketAgentId: string): Promise<boolean> {
        // Check if agent is active
        return !!this.activeConnections[websocketAgentId]
    }

    async removePreviousAgentConnectionIfExists(
        websocketAgentId: string
    ): Promise<void> {
        // Remove previous WebSocket connection of agent if exists
        const existingWebSocket = this.activeConnections[websocketAgentId]
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId]
            await existingWebSocket.close(1000, 'Establishing a new connection')
        }
    }

    sendNewBlockToActiveAgents(block: BlockEvent, cb: (error: any) => void) {
        setImmediate(cb)
        const decoded = cbor.decode(block.body)[1]
        const transactionBodies = cbor.encode(decoded[1]).toString('hex')
        const transactionWitnesses = cbor.encode(decoded[2]).toString('hex')
        const data = {
            'New Block hash': block.headerHash.toString('hex'),
            blockNo: block.blockNo,
            slotNo: block.slotNo,
        }
        Object.values(this.activeConnections).forEach((websocket) => {
            websocket.send(JSON.stringify(data))
        })

        if (transactionBodies !== '80' && transactionWitnesses !== '80') {
            const transaction = parseTransaction(decoded)
            const filteredTransaction = {
                transactionBody: transaction.body,
                transactionWitnessSet: transaction.witnessSet,
                auxiliaryDataSet: transaction.auxiliaryData,
            }
            Object.values(this.activeConnections).forEach((websocket) => {
                websocket.send(
                    JSON.stringify(filteredTransaction, bigIntReplacer)
                )
            })
        }
    }
}

const manager = new WebSocketConnectionManager()
export default manager
