import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

// ...existing code...
export const schema: FunctionSchemaSpec = {
    id: 'proposalNewConstitution',
    name: 'Constitution',
    description: 'Submit a new constitution',
    params: [
        { name: 'anchor', schema: { type: 'object', description: 'Anchor { url, dataHash }' } },
        { name: 'newConstitution', schema: { type: 'object', description: 'New constitution { url, dataHash }' } },
        {
            name: 'guardrailScript',
            schema: { type: 'string', description: 'Optional guardrail script CBOR', optional: true },
        },
    ],
    response: {
        type: 'object',
        properties: {
            hash: { type: 'string' },
            cborHex: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'Constitution submitted: hash: ${result.hash}',
    },
}

export default async function handler(
    context: FunctionContext,
    anchor: any,
    newConstitution: any,
    guardRailScript: any
) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateProposalMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const newConstitutionData =
        newConstitution['url'] && newConstitution['dataHash'] ? newConstitution : { url, dataHash }
    const req = {
        proposals: [
            {
                anchor: anchorData,
                newconstitution: {
                    ...newConstitutionData,
                    scriptHash: 'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23',
                },
                refundAccount: context.wallet.rewardAddress,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
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
