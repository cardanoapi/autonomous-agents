import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    anchor: Record<string, any>,
    quorum: Record<string, number>,
    add: Record<any, any>,
    remove: Array<any>
) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateProposalMetadataContent()
    )
    const anchorData =
        anchor && anchor['url'] && anchor['dataHash']
            ? anchor
            : { url, dataHash }
    const req = {
        proposals: [
            {
                refundAccount: context.wallet.rewardAddress,
                anchor: anchorData,
                updatecommittee: {
                    add: add,
                    remove: remove,
                    qourum: quorum,
                },
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req, false)
}
