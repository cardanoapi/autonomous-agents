import { FunctionContext } from '../executor/BaseFunction'
import { rewardAddressBech32 } from '../utils/cardano'
import * as blake from 'blakejs'

export default async function handler(
    context: FunctionContext,
    anchor: Record<string, any>
) {
    const metadata = JSON.stringify(generateProposalMetadata())
    const hash = blake.blake2bHex(metadata, undefined, 32)
    const url = await context.builtins.saveMetadata(hash, metadata)
    const rewardAddress = rewardAddressBech32(
        0,
        context.wallet.stakeKey.pubKeyHash
    )
    const req = {
        proposals: [
            {
                refundAccount: rewardAddress,
                anchor: anchor || {
                    url,
                    dataHash: hash,
                },
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req).catch((e) => {
        throw e
    })
}
function generateProposalMetadata() {
    return {
        '@context': {
            CIP100: 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
            CIP108: 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0108/README.md#',
            hashAlgorithm: 'CIP100:hashAlgorithm',
            body: {
                '@id': 'CIP108:body',
                '@context': {
                    references: {
                        '@id': 'CIP108:references',
                        '@container': '@set',
                        '@context': {
                            GovernanceMetadata:
                                'CIP100:GovernanceMetadataReference',
                            Other: 'CIP100:OtherReference',
                            label: 'CIP100:reference-label',
                            uri: 'CIP100:reference-uri',
                            referenceHash: {
                                '@id': 'CIP108:referenceHash',
                                '@context': {
                                    hashDigest: 'CIP108:hashDigest',
                                    hashAlgorithm: 'CIP100:hashAlgorithm',
                                },
                            },
                        },
                    },
                    title: 'CIP108:title',
                    abstract: 'CIP108:abstract',
                    motivation: 'CIP108:motivation',
                    rationale: 'CIP108:rationale',
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
            abstract: 'This is to generate metadata for creating proposals.',
            motivation:
                'This is generated by autonomous-agent-testing for creating proposals',
            references: [
                {
                    '@type': 'Other',
                    label: 'autonomous-agent-testing',
                    uri: 'https://cardanoapi.github.io/autonomous-agents/archietecture_docusaurus/docs/architecture',
                },
            ],
            title: 'Autonomous-agent-testing Proposal Metadata',
        },
    }
}
