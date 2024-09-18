import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    withdrawal: Record<string, any>,
    anchor: Record<string, string>
) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateProposalMetadataContent()
    )
    const anchorData =
        anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        proposals: [
            {
                anchor: anchorData,
                refundAccount: context.wallet.rewardAddress,
                withdraw: withdrawal,
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req, false)
}
