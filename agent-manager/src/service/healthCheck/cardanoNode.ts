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
        return { isHealthy: Date.now() - this.lastTimeStamp < 6 * 60 * 1000, block: this.block }
    }
}

export const cardanoNodeStatus = new CardanoNodeStatus()
