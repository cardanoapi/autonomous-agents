import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    anchor: any,
    newConstitution: any,
    guardRailScript: any
) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateProposalMetadataContent()
    )
    const anchorData =
        anchor && anchor['url'] && anchor['dataHash']
            ? anchor
            : { url, dataHash }
    const newConstitutionData =
        newConstitution['url'] && newConstitution['dataHash']
            ? newConstitution
            : { url, dataHash }
    const req = {
        proposals: [
            {
                anchor: anchorData,
                newConstitution: newConstitutionData,
                refundAccount: context.wallet.rewardAddress,
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
