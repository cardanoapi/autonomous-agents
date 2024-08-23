import { FunctionContext } from '../executor/BaseFunction'
import { rewardAddressBech32 } from '../utils/cardano'

export default async function handler(
    context: FunctionContext,
    anchorObj: any,
    newConstitutionObj: any,
    guardRailScript: any
) {
    const rewardAddress = rewardAddressBech32(
        0,
        context.wallet.stakeKey.pubKeyHash
    )
    const anchor = anchorObj.value
    const newConstitution = newConstitutionObj.value
    const req = {
        proposals: [
            {
                anchor: anchor,
                newConstitution: newConstitution,
                refundAccount: rewardAddress,
                guardrailscript: guardRailScript.value
                    ? guardRailScript.value
                    : undefined,
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
