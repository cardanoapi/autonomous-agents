import { bech32 } from 'bech32'

type CertificateType = 'registerstake' | 'registerdrep' | 'deregisterdrep'

export type TxSubmitResponse = {
    cbor: string
    txId: string
    lockInfo?: any
}

// type KuberBalanceResponse = {
//     txin: string
//     value: any
//     address?: string
// }

class Kuber {
    walletAddr: string
    signingKey: string
    version: string

    KEYHASH_LENGTH = 28

    constructor(walletAddr: string, signingKey: string, version = 'v1') {
        this.walletAddr = walletAddr
        this.signingKey = signingKey
        this.version = version
    }

    static generateCert(type: CertificateType, key: string) {
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
        }
    }

    signTx(tx: any) {
        return {
            ...tx,
            selections: [
                ...(tx.selections || []),
                {
                    type: 'PaymentSigningKeyShelley_ed25519',
                    description: 'Payment Signing Key',
                    cborHex: this.signingKey,
                },
                this.walletAddr,
            ],
            changeAddress: this.walletAddr,
        }
    }

    signAndSubmitTx(tx: any) {
        const signedTx = this.signTx(tx)
        return this.submitTx(signedTx)
    }

    submitTx(signedTx: any) {
        console.info(`Submitting tx: ${JSON.stringify({ tx: signedTx })}`)
        return buildApiObject(
            `/api/${this.version}/tx?submit=true`,
            'POST',
            JSON.stringify(signedTx)
        )
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

const kuberService = {
    submitTransaction(tx: any) {
        return {
            url: '/api/v1/tx/submit',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    tx: {
                        description: '',
                        type: 'Tx ConwayEra',
                        cborHex: tx,
                    },
                }),
                redirect: 'follow',
            },
        }
    },
    transferADA: (
        receiverAddressList: string[],
        ADA = 20,
        address: string,
        signingKey: string
    ) => {
        const kuber = new Kuber(address, signingKey)
        const req = {
            outputs: receiverAddressList.map((addr) => {
                return {
                    address: addr,
                    value: `${ADA}A`,
                }
            }),
        }
        return kuber.signAndSubmitTx(req)
    },

    dRepRegistration: (
        stakeSigningKey: string,
        svkh: string,
        address: string,
        paymentSigningKey: string
    ) => {
        const kuber = new Kuber(address, paymentSigningKey)
        const req = {
            certificates: [Kuber.generateCert('registerdrep', svkh)],
            selections: [
                {
                    type: 'PaymentSigningKeyShelley_ed25519',
                    description: 'Stake Signing Key',
                    cborHex: `${stakeSigningKey}`,
                },
            ],
        }
        return kuber.signAndSubmitTx(req)
    },
    dRepDeRegistration: (
        addr: string,
        signingKey: string,
        stakePrivateKey: string,
        pkh: string
    ) => {
        const kuber = new Kuber(addr, signingKey)
        const selections = [
            {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: stakePrivateKey,
            },
        ]
        const req = {
            selections,
            inputs: addr,
            certificates: [Kuber.generateCert('deregisterdrep', pkh)],
        }
        return kuber.signAndSubmitTx(req)
    },

    stakeDelegation: (
        addr: string,
        signingKey: string,
        stakePrivateKey: string,
        pkh: string,
        dRep: string | 'abstain' | 'noconfidence'
    ) => {
        const kuber = new Kuber(addr, signingKey)
        const selections = [
            {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: stakePrivateKey,
            },
        ]
        const req = {
            selections,
            certificates: [
                {
                    type: 'delegate',
                    key: pkh,
                    drep: dRep,
                },
            ],
        }
        return kuber.signAndSubmitTx(req)
    },
    proposeNewConstitution: (
        addr: string,
        signingKey: string,
        stakePrivateKey: string,
        stakeVerificationKeyHash: string,
        anchorUrl: string,
        anchorDataHash: string,
        newConstitutionUrl: string,
        newConstitutionDataHash: string
    ) => {
        const kuber = new Kuber(addr, signingKey)

        const selections = [
            {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: stakePrivateKey,
            },
        ]

        const rewardAddress = kuber.rewardAddressBech32(
            0,
            stakeVerificationKeyHash
        )

        const req = {
            selections,
            proposals: [
                {
                    anchor: {
                        url: anchorUrl,
                        dataHash: anchorDataHash,
                    },
                    newConstitution: {
                        url: newConstitutionUrl,
                        dataHash: newConstitutionDataHash,
                    },
                    refundAccount: rewardAddress,
                    deposit: 50000000000,
                },
            ],
        }
        return kuber.signAndSubmitTx(req)
    },

    // getBalance: async (addr: string) => {
    //     const utxos: any[] = await callKuber(`/api/v3/utxo?address=${addr}`)
    //     const balanceInLovelace = utxos.reduce(
    //         (acc, utxo) => acc + utxo.value.lovelace,
    //         0
    //     )
    //     return balanceInLovelace / 1000000
    // },

    registerStake: (
        stakePrivateKey: string,
        pkh: string,
        signingKey: string,
        addr: string
    ) => {
        const kuber = new Kuber(addr, signingKey)
        const selections = [
            {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: stakePrivateKey,
            },
        ]
        const req = {
            selections,
            certificates: [Kuber.generateCert('registerstake', pkh)],
        }
        return kuber.signAndSubmitTx(req)
    },

    createInfoGovAction(
        address: string,
        signingKey: string,
        anchorUrl?: string,
        anchorDataHash?: string,
        stakeKeyHash?: string
    ) {
        const kuber = new Kuber(address, signingKey)
        const infoProposal = {
            deposit: 50000000000,
            refundAccount: {
                network: 'Testnet',
                credential: {
                    'key hash':
                        stakeKeyHash ||
                        'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23',
                },
            },
            anchor: {
                url: anchorUrl || 'https://bit.ly/3zCH2HL',
                dataHash:
                    anchorDataHash ||
                    '1111111111111111111111111111111111111111111111111111111111111111',
            },
        }
        const req = kuber.signTx({
            proposals: [infoProposal],
        })
        return buildApiObject(
            '/api/v1/tx?submit=true',
            'POST',
            JSON.stringify(req)
        )
    },

    // getTransactionDetails(txHash: string) {
    //     return fetch(config.apiUrl + '/api/v3/utxo?txin=' + txHash + '%230', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'api-key': config.apiKey,
    //         },
    //     })
    // },

    // queryUtxos(address: string) {
    //     return callKuber('/api/v3/utxo?address=' + address)
    // },

    voteOnProposal(
        addr: string,
        signingKey: string,
        voter: string, // dRepHash
        dRepStakePrivKey: string,
        proposal: string
    ) {
        const kuber = new Kuber(addr, signingKey)
        const req = {
            selections: [
                {
                    type: 'PaymentSigningKeyShelley_ed25519',
                    description: 'Payment Signing Key',
                    cborHex: dRepStakePrivKey,
                },
            ],
            vote: {
                voter,
                role: 'drep',
                proposal,
                vote: true,
                anchor: {
                    url: 'https://bit.ly/3zCH2HL',
                    dataHash:
                        '1111111111111111111111111111111111111111111111111111111111111111',
                },
            },
        }
        return kuber.signAndSubmitTx(req)
    },

    abstainDelegations(
        stakePrivKeys: string[],
        stakePkhs: string[],
        address: string,
        signingKey: string
    ) {
        const kuber = new Kuber(address, signingKey)
        const selections = stakePrivKeys.map((key) => {
            return {
                type: 'PaymentSigningKeyShelley_ed25519',
                description: 'Payment Signing Key',
                cborHex: key,
            }
        })

        const certificates = stakePkhs.map((pkh) => {
            return {
                type: 'delegate',
                key: pkh,
                drep: 'abstain',
            }
        })
        const req = {
            selections,
            certificates,
        }
        return kuber.signAndSubmitTx(req)
    },
}

function buildApiObject(
    path: any,
    method: 'GET' | 'POST' = 'GET',
    body?: BodyInit,
    contentType = 'application/json'
) {
    const headers: Record<string, string> = {}
    if (contentType) {
        headers['content-type'] = contentType
    }

    const options: RequestInit = {
        method,
        headers,
    }

    if (method === 'POST') {
        if (body) options.body = body
    }
    return {
        url: path,
        options,
    }
}

export default kuberService
