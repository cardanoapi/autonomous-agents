import { FunctionContext } from '../executor/BaseFunction'
import { rewardAddressBech32 } from '../utils/cardano'

export default async function handler(
    context: FunctionContext,
    anchor: Record<string, any>
) {
    const rewardAddress = rewardAddressBech32(
        0,
        context.wallet.stakeKey.pubKeyHash
    )
    const req = {
        proposals: [
            {
                refundAccount: rewardAddress,
                anchor: anchor,
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req).catch((e) => {
        throw e
    })
}
