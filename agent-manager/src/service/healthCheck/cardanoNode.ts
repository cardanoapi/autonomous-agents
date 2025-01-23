import { BlockEvent } from 'libcardano/types'

interface IBlock {
    blockNo: number
    hash: string
    slot: number
}

class CardanoNodeStatus {
    lastTimeStamp: number = 0
    block: IBlock | null = null

    onBlockTimeStamp(timeStamp: number, block: BlockEvent) {
        this.lastTimeStamp = timeStamp
        this.block = {
            hash: block.headerHash.toString('hex'),
            blockNo: block.blockNo,
            slot: block.slotNo,
        }
    }

    checkStatus() {
        const currentTimeStamp = Date.now()
        const secsSinceLastBlock = currentTimeStamp - this.lastTimeStamp
        return {
            isHealthy: secsSinceLastBlock < 6 * 60 * 1000,
            block: this.block,
            secsSinceLastBlock: Math.floor(secsSinceLastBlock / 1000),
            lastBlockTimeStamp: this.lastTimeStamp,
        }
    }
}

export const cardanoNodeStatus = new CardanoNodeStatus()
