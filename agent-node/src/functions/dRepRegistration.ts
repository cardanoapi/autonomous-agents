import { FunctionContext } from '../executor/BaseFunction'

export default async function builtin(context: FunctionContext) {
    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey.pubKeyHash,
                anchor: {
                    url: 'https://bit.ly/3zCH2HL',
                    dataHash:
                        '1111111111111111111111111111111111111111111111111111111111111111',
                },
            },
        ],
    }

    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => {
            console.log('drepRegistration', v)
            return v
        })
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
