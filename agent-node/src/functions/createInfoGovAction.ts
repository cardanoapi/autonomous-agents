import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    anchorObj: any
) {
    const anchor = anchorObj.value
    const req = {
        proposals: [
            {
                refundAccount: {
                    network: 'Testnet',
                    credential: {
                        'key hash':
                            context.wallet.stakeKey.pubKeyHash ||
                            'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23',
                    },
                },
                anchor: anchor,
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req).catch((e) => {
        throw e
    })
}
