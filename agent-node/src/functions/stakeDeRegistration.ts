import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'stakeDeRegistration',
    name: 'Stake De-registration',
    description: 'Deregister stake key for this agent (submit deregistration certificate).',
    params: [],
    response: {
        type: 'object',
        properties: {
            cborHex: { type: 'string' },
            description: { type: 'string' },
            hash: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'Stake deregistration submitted: hash: ${result.hash}',
    },
}

export default async function handler(context: FunctionContext) {
    const req = {
        inputs: context.wallet.address,
        outputs: {
            address: context.wallet.address,
            value: '10A',
            addChange: true,
        },
        certificates: [
            {
                type: 'deregisterstake',
                key: context.wallet.stakeKey.pubKeyHash,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch((e) => {
            throw e
        })
}
