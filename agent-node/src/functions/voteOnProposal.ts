import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    proposal: Record<string, any>,
    anchor: Record<string, any>,
    voteType: 'yes' | 'no' | 'abstain'
) {
    const { dataHash, url } = await context.builtins.saveMetadata(context.helpers.generateVoteMetadataContent())
    const anchorData = anchor && anchor['url'] && anchor['dataHash'] ? anchor : { url, dataHash }
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal: proposal,
            vote: voteType,
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
            ? matchedFilterIndexes.map((p: any) => ({
                  name: 'proposalId',
                  value: `${tx.hash.toString('hex')}#${p.matchedIndex}`,
              }))
            : null
    } catch (err) {
        console.error('VoteOnProposalFilterError : ', err)
        return null
    }
}
