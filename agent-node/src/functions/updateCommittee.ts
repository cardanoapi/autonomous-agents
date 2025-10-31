import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'updateCommittee',
    name: 'Update Committee',
    description: 'Modify committee membership/quorum',
    params: [
        { name: 'anchor', schema: { type: 'object', description: 'Anchor { url, dataHash }' } },
        { name: 'quorum', schema: { type: 'object', description: '{ numerator: number, denominator: number }' } },
        {
            name: 'add',
            schema: { type: 'object', description: 'Record { credentialHash: expiryEpoch }', optional: true },
        },
        { name: 'remove', schema: { type: 'list', description: 'Record of credentialHash → true', optional: true } },
    ],
    response: {
        type: 'object',
        properties: {
            hash: { type: 'string' },
            cborHex: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'Update committee submitted: hash: ${result.hash}',
    },
}

export default async function handler(
    context: FunctionContext,
    anchor: Record<string, any>,
    quorum: Record<string, number>,
    add: Record<any, any>,
    remove: Array<any>
) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateProposalMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        proposals: [
            {
                refundAccount: context.wallet.rewardAddress,
                anchor: anchorData,
                updatecommittee: {
                    add: add,
                    remove: remove,
                    qourum: quorum,
                },
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req, false).catch(async (e) => {
        if (e.includes('ProposalReturnAccountDoesNotExist')) {
            await context.builtins.registerStake().catch((e) => {
                throw e
            })
            return context.wallet
                .buildAndSubmit(req)
                .then((v) => v)
                .catch((e) => {
                    throw e
                })
        } else {
            throw e
        }
    })
}
