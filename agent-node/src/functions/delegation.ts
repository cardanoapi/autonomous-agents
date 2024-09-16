import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    delegation: any
) {
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
