import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    receiverAddress: string,
    value: number | string | Record<string, any>
) {
    const req = {
        outputs: {
            address: receiverAddress,
            value: value,
        },
    }
    await context.builtins.callWebhook('https://metadata-govtool.cardanoapi.io/lock',"32")
    return await context.wallet.buildAndSubmit(req)
}
