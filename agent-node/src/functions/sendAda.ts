import { FunctionContext } from "./BaseFunction"

export default async function handler(
    context:FunctionContext,
    receiverAddress:string,
    value:number|string|Record<string,any>){
    const req = {
        outputs: {
            address: receiverAddress,
            value: value,
        },
    }
    return await context.wallet.buildAndSubmit(req)
}