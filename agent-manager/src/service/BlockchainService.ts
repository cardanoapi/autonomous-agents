import { createInMemoryClientWithPeer } from 'libcardano/helper'

export function createBlockchainInstance() {
    return createInMemoryClientWithPeer(process.env['CARDANO_NODE_URL']!, {
        networkMagic: parseInt(process.env.CARDANO_NETWORK_MAGIC!) || 4,
        startPoint: 'Latest',
        autoReconnect: true,
    })
}
