import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    proposal: Record<string, any>,
    anchor: Record<string, any>
) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateVoteMetadataContent()
    )
    const anchorData =
        anchor && anchor['url'] && anchor['dataHash']
            ? anchor
            : { url, dataHash }
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

export function filter(context: FunctionContext) {
    if (!context.filter || !context.event) return null
    const tx = context.event.tx
    try {
        const filters = context.filter['proposalProcedures']
        const matchedFilterIndexes = filters.map((i: any) => !!i.matchedIndex)
        return matchedFilterIndexes.length
            ? matchedFilterIndexes.map((p: any, index: number) => ({
                  name: 'proposalId',
                  value: `${tx.hash.toString('hex')}#${index}`,
              }))
            : null
    } catch (err) {
        return null
    }
}
