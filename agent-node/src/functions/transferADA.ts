import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    receiverAddress: string,
    value: number | string | Record<string, any>
) {
    const req = {
        outputs: {
            address: receiverAddress,
            value: `${value}A`,
        },
    }
    return await context.wallet
        .buildAndSubmit(req)
        .then((v) => v)
        .catch((err) => {
            console.log('Transfer ADA Error : ', err)
            throw err
        })
}
