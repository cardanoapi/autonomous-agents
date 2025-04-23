import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(context: FunctionContext, anchor: Record<string, any>) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateProposalMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        proposals: [
            {
                refundAccount: context.wallet.rewardAddress,
                anchor: anchorData,
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req).catch(async (e) => {
        if (e.includes('ProposalReturnAccountDoesNotExist')) {
            await context.builtins.registerStake().catch((e) => {
                throw e
            })
            return context.wallet
                .buildAndSubmit(req)
                .then((v) => v)
                .catch((e) => {
                    throw e
                })
        } else {
            throw e
        }
    })
}
