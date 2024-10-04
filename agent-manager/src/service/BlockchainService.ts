import { createInMemoryClientWithPeer } from 'libcardano/helper'

const networkMagic = process.env.CARDANO_NETWORK_MAGIC ?  parseInt(process.env.CARDANO_NETWORK_MAGIC!) || 4 : 4

export function createBlockchainInstance() {
    return createInMemoryClientWithPeer(process.env['CARDANO_NODE_URL']!, {
        networkMagic: parseInt(process.env.CARDANO_NETWORK_MAGIC!) || 4,
        startPoint: 'Latest',
        autoReconnect: true,
    })
}
