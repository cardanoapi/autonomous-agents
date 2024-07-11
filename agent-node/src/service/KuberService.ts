import { bech32 } from 'bech32'

type CertificateType =
    | 'registerstake'
    | 'registerdrep'
    | 'deregisterdrep'
    | 'delegate'

export type TxSubmitResponse = {
    cbor: string
    txId: string
    lockInfo?: any
}

export class Kuber {
    walletAddr: string
    signingKey: string
    version: string

    KEYHASH_LENGTH = 28

    constructor(walletAddr: string, signingKey: string, version = 'v1') {
        this.walletAddr = walletAddr
        this.signingKey = signingKey
        this.version = version
    }

    static generateCert(type: CertificateType, key: string, dRep: string = '') {
        if (type === 'registerstake' || type === 'deregisterdrep') {
            return {
                type: type,
                key: key,
            }
        } else if (type === 'registerdrep') {
            return {
                type: 'registerdrep',
                key: key,
                anchor: {
                    url: 'https://bit.ly/3zCH2HL',
                    dataHash:
                        '1111111111111111111111111111111111111111111111111111111111111111',
                },
            }
        } else if (type === 'delegate' && dRep) {
            return {
                type: 'delegate',
                key: key,
                drep: dRep,
            }
        }
    }

    signTx(tx: any, stakePrivateKey = '') {
        const selections = [
            ...(tx.selections || []),
            {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: this.signingKey,
            },
            this.walletAddr,
        ]
        if (stakePrivateKey) {
            selections.push({
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: stakePrivateKey,
            })
        }
        return {
            ...tx,
            selections,
            changeAddress: this.walletAddr,
        }
    }

    rewardAddressRawBytes(network: number, stakevkh: string) {
        const rewardAccountPrefix = 0xe0
        const header = network | rewardAccountPrefix
        const result = new Uint8Array(this.KEYHASH_LENGTH + 1)
        result[0] = header
        result.set(Buffer.from(stakevkh, 'hex'), 1)
        return result
    }

    rewardAddressBech32(networkId: number, stakevkh: string): string {
        const prefix = networkId == 0 ? 'stake_test' : 'stake'
        return bech32.encode(
            prefix,
            bech32.toWords(
                Buffer.from(this.rewardAddressRawBytes(networkId, stakevkh))
            ),
            200
        )
    }
}
