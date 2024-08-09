import { FunctionContext } from '../executor/BaseFunction'

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
        .buildAndSubmit(req, true)
        .then((v) => console.log('drepDeRegistration', v))
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
