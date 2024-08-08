import { FunctionContext } from '../executor/BaseFunction'

export function myTest() {}

export default async function handler(context: FunctionContext) {
    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey,
                anchor: {
                    url: 'https://bit.ly/3zCH2HL',
                    dataHash:
                        '1111111111111111111111111111111111111111111111111111111111111111',
                },
            },
        ],
    }
    console.log('ssssssss')
    await context.builtins.waitTxConfirmation(
        'shshshhshshshhshshshhshshhshshhshshhsh',
        2,
        50
    )
    console.log('second')

    return await context.wallet
        .buildAndSubmit(req)
        .then((v) => console.log('then', v))
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
