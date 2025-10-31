import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'dRepRegistration',
    name: 'DRep Registration',
    description: 'Register as a Delegated Representative',
    params: [
        {
            name: 'anchor',
            schema: {
                type: 'object',
                description: 'Optional anchor object { url, dataHash } (leave empty to auto-generate)',
                optional: true,
            },
        },
    ],
    response: {
        type: 'object',
        properties: { hash: { type: 'string' } },
        response_text: 'DRep Registration submitted: hash: ${result.hash}',
    },
}

export default async function builtin(context: FunctionContext, anchor: any) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateDrepMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey.pubKeyHash,
                anchor: anchorData,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true, true)
        .then((v) => {
            console.log('drepRegistration', v)
            return v
        })
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
