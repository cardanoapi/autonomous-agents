import { bech32 } from 'bech32'
import { HdKey } from 'libcardano'
import { globalRootKeyBuffer } from '../constants/global'

const KEYHASH_LENGTH = 28

export function rewardAddressRawBytes(network: number, stakevkh: string) {
    const rewardAccountPrefix = 0xe0
    const header = network | rewardAccountPrefix
    const result = new Uint8Array(KEYHASH_LENGTH + 1)
    result[0] = header
    result.set(Buffer.from(stakevkh, 'hex'), 1)
    return result
}

export function rewardAddressBech32(
    networkId: number,
    stakevkh: string
): string {
    const prefix = networkId == 0 ? 'stake_test' : 'stake'
    return bech32.encode(
        prefix,
        bech32.toWords(Buffer.from(rewardAddressRawBytes(networkId, stakevkh))),
        200
    )
}

export function loadRootKeyFromBuffer() {
    const rootKeyBuffer = globalRootKeyBuffer.value
    if (!rootKeyBuffer) {
        console.error('No RootKeyBuffer Found')
        process.exit(1)
    }
    return HdKey.fromBytes(rootKeyBuffer)
}

export function bech32toHex(bechAddress: string) {
    const decodedId = bech32.decode(bechAddress, 100)
    const data = bech32.fromWords(decodedId.words)
    return Buffer.from(data).toString('hex')
}
