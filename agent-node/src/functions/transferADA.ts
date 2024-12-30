import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    receiverAddress: string,
    receivingAda: number
) {
    const req = {
        outputs: {
            address: receiverAddress,
            value: `${receivingAda}A`,
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


