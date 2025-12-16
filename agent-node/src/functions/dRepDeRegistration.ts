import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'dRepDeRegistration',
    name: 'DRep De‑registration',
    description: 'Deregister the DRep associated with this agent (submit deregistration certificate).',
    params: [],
    response: {
        type: 'object',
        properties: {
            cborHex: { type: 'string' },
            description: { type: 'string' },
            hash: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'DRep de‑registration submitted: hash: ${result.hash}',
    },
}

export default async function handler(context: FunctionContext) {
    const req = {
        inputs: context.wallet.address,
        certificates: [
            {
                type: 'deregisterdrep',
                key: context.wallet.stakeKey.pubKeyHash,
            },
        ],
    }

    return await context.wallet
        .buildAndSubmit(req, true, true)
        .then((v) => {
            console.log('drepDeRegistration', v)
            return v
        })
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
