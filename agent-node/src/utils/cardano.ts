import { bech32 } from 'bech32'

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
