import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(context: FunctionContext) {
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
