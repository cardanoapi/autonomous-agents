
import { FunctionContext } from "./BaseFunction"

export default async function handler(
    context:FunctionContext,){
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
            }
        ],
    }
    return await context.wallet.buildAndSubmit(req)
}

