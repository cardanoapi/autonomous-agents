import { FunctionContext } from '../executor/BaseFunction'

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
