export function generateRegisterDrepMetadataContent(drepName: string, paymentAddress: string) {
    return JSON.stringify({
        '@context': {
            '@language': 'en-us',
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
                            GovernanceMetadata: 'CIP100:GovernanceMetadataReference',
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
            motivations: 'This Drep is generated automatically by autonomous-agent-testing',
            objectives: 'This is the automatically generated DRep for testing.',
            paymentAddress: `${paymentAddress}`,
            qualifications: 'Known for running test in cardano blockchain.',
            references: [
                {
                    '@type': 'Link',
                    label: 'Autonomous_Agent_Docs',
                    uri: 'https://cardanoapi.github.io/autonomous-agents/archietecture_docusaurus/docs/architecture',
                },
                {
                    '@type': 'Identity',
                    label: 'Autonomous_Agent',
                    uri: 'https://agents.cardanoapi.io',
                },
            ],
        },
    })
}
