import { createInMemoryClientWithPeer } from 'libcardano/helper'

export function createBlockchainInstance() {
    return createInMemoryClientWithPeer(process.env['CARDANO_NODE_URL'], {
        networkMagic: 4,
        startPoint: 'Latest',
        autoReconnect: true,
    })
}
