import { BlockHeaderEvent } from 'libcardano/types'
import { Transaction } from 'libcardano/cardano/ledger-serialization/transaction'

export interface DecodedBlock extends BlockHeaderEvent {
    body: Transaction[]
}

interface IPendingTx {
    resolve: (args: DecodedBlock) => void
    index: number
    destinationIndex: number
    block: DecodedBlock | null
}

function checkAndResolvePendingTx(pendingTxs: Record<string, IPendingTx>) {
    const deletionTxs: Array<string> = []
    Object.keys(pendingTxs).forEach((key) => {
        const tx = pendingTxs[key]
        if (tx.index === tx.destinationIndex) {
            deletionTxs.push(key)
            tx.block && tx.resolve(tx.block)
        }
        tx.index = tx.index + 1
    })
    deletionTxs.forEach((txId) => delete pendingTxs[txId])
}

export class TxListener {
    MAX_BLOCK_COUNT = 10
    blocks: Array<DecodedBlock> = [] // maintain last 10 blocks
    pendingTxs: Record<string, IPendingTx> = {}
    onBlock(block: DecodedBlock) {
        if (Object.keys(this.pendingTxs).length) {
            block.body.forEach((tx) => {
                const txId = tx.hash.toString('hex')
                if (this.pendingTxs[txId]) {
                    this.pendingTxs[txId].block = block
                }
            })
        }
        checkAndResolvePendingTx(this.pendingTxs)
        if (this.blocks.length >= this.MAX_BLOCK_COUNT) {
            this.blocks.pop()
            this.blocks.unshift(block)
        } else {
            this.blocks.unshift(block)
        }
    }

    onRollback() {}
    addListener(txId: string, confirmation_count: number, timeout: number) {
        return new Promise((resolve, reject) => {
            console.log(`AddListener started with timeout of ${timeout}ms`)
            const txMatched = this.blocks.some((block) => {
                return block.body.some((tx) => {
                    return tx.hash.toString('hex') === txId
                })
            })
            if (txMatched) {
                const txMatchedIndex = this.blocks.findIndex((block) => {
                    return block.body.some((tx) => {
                        return tx.hash.toString('hex') === txId
                    })
                })
                if (
                    txMatchedIndex + confirmation_count >
                    this.MAX_BLOCK_COUNT
                ) {
                    this.pendingTxs[txId] = {
                        resolve,
                        index: 0,
                        destinationIndex:
                            confirmation_count - (10 - txMatchedIndex),
                        block: this.blocks[txMatchedIndex],
                    }
                } else {
                    resolve(this.blocks[txMatchedIndex])
                }
            } else {
                setTimeout(() => {
                    delete this.pendingTxs[txId]
                    reject(new Error(`Rejected after ${timeout} ms`))
                }, timeout)
                this.pendingTxs[txId] = {
                    resolve,
                    index: 0,
                    destinationIndex: confirmation_count,
                    block: null,
                }
            }
        })
    }
}
