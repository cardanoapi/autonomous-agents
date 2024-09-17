import { FunctionContext } from '../executor/BaseFunction'
import * as blake from 'blakejs'

export default async function handler(
    context: FunctionContext,
    proposal: Record<string, any>,
    anchor: Record<string, any>
) {
    const metadata = JSON.stringify(generateVoteMetadata())
    const hash = blake.blake2bHex(metadata, undefined, 32)
    const url = await context.builtins.saveMetadata(hash, metadata)
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal: proposal,
            vote: true,
            anchor: anchor ?? {
                url: url,
                dataHash: hash,
            },
        },
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
            if (e.includes('VotersDoNotExist')) {
                await context.builtins.dRepRegistration()
                return context.wallet
                    .buildAndSubmit(req, true)
                    .then((v) => v)
                    .catch((e) => {
                        throw e
                    })
            } else {
                throw e
            }
        })
}

function generateVoteMetadata() {
    return {
        '@context': {
            CIP100: 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
            hashAlgorithm: 'CIP100:hashAlgorithm',
            body: {
                '@id': 'CIP100:body',
                '@context': {
                    references: {
                        '@id': 'CIP100:references',
                        '@container': '@set',
                        '@context': {
                            GovernanceMetadata:
                                'CIP100:GovernanceMetadataReference',
                            Other: 'CIP100:OtherReference',
                            label: 'CIP100:reference-label',
                            uri: 'CIP100:reference-uri',
                            referenceHash: {
                                '@id': 'CIP100:referenceHash',
                                '@context': {
                                    hashDigest: 'CIP100:hashDigest',
                                    hashAlgorithm: 'CIP100:hashAlgorithm',
                                },
                            },
                        },
                    },
                    comment: 'CIP100:comment',
                    externalUpdates: {
                        '@id': 'CIP100:externalUpdates',
                        '@context': {
                            title: 'CIP100:update-title',
                            uri: 'CIP100:uri',
                        },
                    },
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
        body: {
            comment:
                'This is the automated message generated by autonomous-agent-testing for voting.',
        },
        hashAlgorithm: 'blake2b-256',
    }
}
