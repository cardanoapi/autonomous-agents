import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'delegation',
    name: 'Delegation',
    description: 'Delegate voting power: abstain | no-confidence | Drep/Pool',
    params: [
        {
            name: 'delegation_params',
            schema: {
                type: 'string',
                description: "One of: 'Abstain', 'No Confidence', 'Drep/Pool'",
            },
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
        response_text: 'Delegation submitted: hash: ${result.hash}',
    },
}

export default async function handler(context: FunctionContext, delegation: any) {
    let drep = ''
    if (typeof delegation === 'string') {
        drep = delegation
    } else {
        drep = delegation.drep || delegation.pool
    }
    const req = {
        certificates: [
            {
                type: 'delegate',
                key: context.wallet.stakeKey.pubKeyHash,
                drep: drep,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
            if (e.includes('StakeKeyNotRegisteredDELEG')) {
                await context.builtins.registerStake()
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
