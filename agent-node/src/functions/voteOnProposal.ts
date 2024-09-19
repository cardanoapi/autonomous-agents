import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    proposal: Record<string, any>,
    anchor: Record<string, any>
) {
    const { hash, url } = await context.builtins.saveMetadata(
        context.helpers.generateVoteMetadataContent()
    )
    const anchorData =
        anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash: hash }
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal: proposal,
            vote: true,
            anchor: anchorData,
        },
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
            if (e.includes('VotersDoNotExist')) {
                await context.builtins.dRepRegistration()
                return context.wallet
                    .buildAndSubmit(req, true)
                    .then((v) => v)
                    .catch((e) => {
                        throw e
                    })
            } else {
                throw e
            }
        })
}
