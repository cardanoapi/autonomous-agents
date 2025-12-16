import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'registerStake',
    name: 'Register Stake Key',
    description: 'Register the agent stake key on-chain (submit registration certificate).',
    params: [],
    response: {
        type: 'object',
        properties: {
            cborHex: { type: 'string' },
            description: { type: 'string' },
            hash: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'Stake registration submitted: hash: ${result.hash}',
    },
}
export default async function builtin(context: FunctionContext) {
    const req = {
        certificates: [
            {
                type: 'registerstake',
                key: context.wallet.stakeKey.pubKeyHash,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch((e) => {
            if (e.includes('StakeKeyRegisteredDELEG')) {
                throw new Error('Stake is already registered')
            }
            throw e
        })
}
