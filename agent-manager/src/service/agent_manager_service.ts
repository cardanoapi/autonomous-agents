import {WebSocket} from "ws";
import {fetchAgentConfiguration} from "../repository/agent_manager_repository";
import {parseTransaction} from "libcardano/cardano/ledger-serialization/transaction";
import cbor from 'libcardano/lib/cbor'
import {createInMemoryClientWithPeer} from "libcardano/src/helper"
import {Cert} from "libcardano/cardano/ledger-serialization/certificates";


const bigIntReplacer = (key:any, value:any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};
class WebSocketConnectionManager {
    activeConnections: { [key: string]: WebSocket } = {};
    async connectWebSocket(websocketAgentId: string, websocket: WebSocket): Promise<void> {
        this.activeConnections[websocketAgentId] = websocket;
    }


    async disconnectWebSocket(websocketAgentId: string): Promise<void> {
        // Disconnect WebSocket connection of agent
        const existingWebSocket = this.activeConnections[websocketAgentId];
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId];
            await existingWebSocket.close(1000, 'Connection closed');
        }
    }

        async sendToWebSocket(websocketAgentId: string, message: any): Promise<void> {
        // Send message to WebSocket connection of agent
        const agent_active = await this.checkIfAgentActive(websocketAgentId)
        if (agent_active) {
            const websocket = this.activeConnections[websocketAgentId];
            if (websocket) {
                try {
                   if (message.message === 'config_updated') {
                        // Fetch updated configuration
                        const { instanceCount, configurations } = await fetchAgentConfiguration(websocketAgentId);
                        const updatedMessage = {
                            message: 'config_updated',
                            instance_count: Number(instanceCount),
                            configurations,
                        };
                        await websocket.send(JSON.stringify(updatedMessage));
                    } else if (message.message === 'cardano-node-blocks') {
                        const blockchain = createInMemoryClientWithPeer(process.env["CARDANO_NODE_URL"], 4, false);

                        // blockchain.pipeline("extendBlock", (block, cb) => {
                        //     setImmediate(cb);
                        //     const decoded = cbor.decode(block.body)[1];
                        //     const transactionBodies = cbor.encode(decoded[1]).toString('hex');
                        //     const transactionWitnesses = cbor.encode(decoded[2]).toString('hex');
                        //     console.log("New Block hash:", block.headerHash.toString('hex'), "blockNo:", block.blockNo, "slotNo:", block.slotNo)
                        //     //
                        //     // decoded[1].map(
                        //     //     (val: any) =>{
                        //     //         bech32.decode(val)
                        //     //     }
                        //     // )
                        //     if (transactionBodies !== "80" && transactionWitnesses !== "80") {
                        //         const transaction = parseTransaction(decoded[1], decoded[2], decoded[3]);
                        //         const filteredTransaction = {
                        //             transactionBody: transaction.transactionBody.map(removeUndefined),
                        //             transactionWitnessSet: transaction.transactionWitnessSet.map(removeUndefined),
                        //             auxiliaryDataSet: transaction.auxiliaryDataSet
                        //         };
                        //         websocket.send(JSON.stringify(filteredTransaction,bigIntReplacer));
                        //
                        //         //  const certificates: Cert[] = filteredTransaction.transactionBody
                        //         // .map(txBody => txBody.certificates)
                        //         // .filter(cert => cert !== undefined)
                        //         // .flat();
                        //          // console.log(certificates)
                        //         // if (certificates && certificates.length > 0) {
                        //         //     // console.log("Block Contents:");
                        //         //     certificates.forEach((certificates:any) => {
                        //         //         if (certificates.type === 'registerStake') {
                        //         //             // console.log('here')
                        //         //             const cardanoBlockMsg = {
                        //         //                 type: certificates.type || undefined,
                        //         //                 key: certificates.key.keyHash.toString('hex') || undefined,
                        //         //                 drep: certificates.key.keyHash.toString('hex') || undefined,
                        //         //             };
                        //         //             // websocket.send(JSON.stringify(cardanoBlockMsg));
                        //         //             // console.log(cardanoBlockMsg)
                        //         //         }
                        //         //     });
                        //         // }
                        //     }
                        // });


                       //new

                       blockchain.pipeline("extendBlock", (block, cb) => {
                        setImmediate(cb)
                        const decoded = cbor.decode(block.body)[1]
                        const transactionBodies = cbor.encode(decoded[1]).toString('hex')
                        const transactionWitnesses = cbor.encode(decoded[2]).toString('hex')
                           var data = {
                                "New Block hash": block.headerHash.toString('hex'),
                                "blockNo": block.blockNo,
                                "slotNo": block.slotNo
                            };
                        websocket.send(JSON.stringify(data))

                        if (transactionBodies !== "80" && transactionWitnesses !== "80") {
                            const transaction = parseTransaction(decoded[1], decoded[2], decoded[3])
                            const filteredTransaction = {
                                transactionBody: transaction.transactionBody.map(removeUndefined),
                                transactionWitnessSet: transaction.transactionWitnessSet.map(removeUndefined),
                                auxiliaryDataSet: transaction.auxiliaryDataSet
                            }
                             websocket.send(JSON.stringify(filteredTransaction,bigIntReplacer));
                        }
                        else {
                        }
                    })

                    } else {
                        await websocket.send(JSON.stringify(message));
                    }

                                    } catch (error) {
                                        console.log(`Error sending message to agent ${websocketAgentId}: ${error}`);
                                    }
                                } else {
                                    console.log((`Agent ${websocketAgentId} is not connected`));
                                }
                            }
                        }


    async checkIfAgentActive(websocketAgentId: string): Promise<boolean> {
        // Check if agent is active
        return !!this.activeConnections[websocketAgentId];
    }

    async removePreviousAgentConnectionIfExists(websocketAgentId: string): Promise<void> {
        // Remove previous WebSocket connection of agent if exists
        const existingWebSocket = this.activeConnections[websocketAgentId];
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId];
            await existingWebSocket.close(1000, 'Establishing a new connection');
        }
    }

}

function replacer(key:any, value:any) {
    return typeof value === 'bigint' ? value.toString() : value;
}

function removeUndefined(obj: Record<string, any>): Record<string, any> {
    const newObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            newObj[key] = value;
        }
    }
    return newObj;
}


const manager = new WebSocketConnectionManager();
export default manager;
