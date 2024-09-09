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

function checkAndResolvePendingTx(
    pendingTxs: Record<string, Array<IPendingTx>>
) {
    Object.keys(pendingTxs).forEach((key) => {
        const txs = pendingTxs[key]
        txs.map((tx) => {
            if (tx.block) {
                if (tx.index === tx.destinationIndex) {
                    tx.resolve(tx.block)
                } else {
                    tx.index = tx.index + 1
                    return tx
                }
            } else return tx
        }).filter((tx) => tx)
    })
    Object.keys(pendingTxs).forEach((key) => {
        if (!pendingTxs[key].length) {
            delete pendingTxs[key]
        }
    })
}

export class TxListener {
    MAX_BLOCK_COUNT = 10
    blocks: Array<DecodedBlock> = [] // maintain last 10 blocks
    pendingTxs: Record<string, Array<IPendingTx>> = {}
    onBlock(block: DecodedBlock) {
        if (Object.keys(this.pendingTxs).length) {
            block.body.forEach((tx) => {
                const txId = tx.hash.toString('hex')
                if (this.pendingTxs[txId]) {
                    this.pendingTxs[txId].forEach((pendingTx) => {
                        pendingTx.block = block
                    })
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
            !this.pendingTxs[txId] && (this.pendingTxs[txId] = [])
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
                    this.pendingTxs[txId].push({
                        resolve,
                        index: 0,
                        destinationIndex:
                            confirmation_count - (10 - txMatchedIndex),
                        block: this.blocks[txMatchedIndex],
                    })
                } else {
                    delete this.pendingTxs[txId]
                    resolve(this.blocks[txMatchedIndex])
                }
            } else {
                setTimeout(() => {
                    delete this.pendingTxs[txId]
                    reject(new Error(`Rejected after ${timeout} ms`))
                }, timeout)
                this.pendingTxs[txId].push({
                    resolve,
                    index: 0,
                    destinationIndex: confirmation_count,
                    block: null,
                })
            }
        })
    }
}
