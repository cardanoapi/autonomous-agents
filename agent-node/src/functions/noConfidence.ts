import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'noConfidence',
    name: 'No Confidence',
    description: 'Submit a No‑Confidence governance action. Optionally provide an anchor {url,dataHash}.',
    params: [
        {
            name: 'anchor',
            schema: { type: 'object', description: 'Optional anchor object { url, dataHash }', optional: true },
        },
    ],
    response: {
        type: 'object',
        properties: {
            cborHex: { type: 'string' },
            description: { type: 'string' },
            hash: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'No‑confidence submitted: hash: ${result.hash}',
    },
}

export default async function handler(context: FunctionContext, anchor: any) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateProposalMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        proposals: [
            {
                refundAccount: context.wallet.rewardAddress,
                anchor: anchorData,
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req).catch(async (e) => {
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
