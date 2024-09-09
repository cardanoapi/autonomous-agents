import { FunctionContext } from '../executor/BaseFunction'
import { rewardAddressBech32 } from '../utils/cardano'

export default async function handler(
    context: FunctionContext,
    anchor: any,
    newConstitution: any,
    guardRailScript: any
) {
    const rewardAddress = rewardAddressBech32(
        0,
        context.wallet.stakeKey.pubKeyHash
    )
    const req = {
        proposals: [
            {
                anchor: anchor,
                newConstitution: newConstitution,
                refundAccount: rewardAddress,
                guardrailscript: guardRailScript || undefined,
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
