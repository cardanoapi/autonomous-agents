import { FunctionContext } from '../executor/BaseFunction'
import * as blake from 'blakejs'

export default async function builtin(context: FunctionContext) {
    const metadata = JSON.stringify(
        generateRegisterDrepMetadata(
            context.agentName,
            context.wallet.paymentKey.private
        )
    )
    const hash = blake.blake2bHex(metadata, undefined, 32)
    const url = await context.builtins.saveMetadata(hash, metadata)
    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey.pubKeyHash,
                anchor: {
                    url: url,
                    dataHash: hash,
                },
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => {
            console.log('drepRegistration', v)
            return v
        })
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}

function generateRegisterDrepMetadata(
    drepName: string,
    paymentAddress: string
) {
    return {
        '@context': {
            CIP100: 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
            CIP119: 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md#',
            hashAlgorithm: 'CIP100:hashAlgorithm',
            body: {
                '@id': 'CIP119:body',
                '@context': {
                    references: {
                        '@id': 'CIP119:references',
                        '@container': '@set',
                        '@context': {
                            GovernanceMetadata:
                                'CIP100:GovernanceMetadataReference',
                            Identity: 'CIP100:IdentityReference',
                            Link: 'CIP100:LinkReference',
                            Other: 'CIP100:OtherReference',
                            label: 'CIP100:reference-label',
                            uri: 'CIP100:reference-uri',
                            referenceHash: {
                                '@id': 'CIP119:referenceHash',
                                '@context': {
                                    hashDigest: 'CIP119:hashDigest',
                                    hashAlgorithm: 'CIP100:hashAlgorithm',
                                },
                            },
                        },
                    },
                    paymentAddress: 'CIP119:paymentAddress',
                    givenName: 'CIP119:givenName',
                    image: 'CIP119:image',
                    objectives: 'CIP119:objectives',
                    motivations: 'CIP119:motivations',
                    qualifications: 'CIP119:qualifications',
                    doNotList: 'CIP119:doNotList',
                },
            },
            authors: {
                '@id': 'CIP100:authors',
                '@container': '@set',
                '@context': {
                    name: 'http://xmlns.com/foaf/0.1/name',
                    witness: {
                        '@id': 'CIP100:witness',
                        '@context': {
                            witnessAlgorithm: 'CIP100:witnessAlgorithm',
                            publicKey: 'CIP100:publicKey',
                            signature: 'CIP100:signature',
                        },
                    },
                },
            },
        },
        authors: [],
        hashAlgorithm: 'blake2b-256',
        body: {
            givenName: `${drepName}`,
            motivations: 'This is to generate metadata for DREP registration.',
            paymentAddress: `${paymentAddress}`,
            references: [
                {
                    '@type': 'Other',
                    label: 'Label',
                    uri: 'https://cardanoapi.github.io/autonomous-agents/archietecture_docusaurus/docs/architecture',
                },
            ],
        },
    }
}
