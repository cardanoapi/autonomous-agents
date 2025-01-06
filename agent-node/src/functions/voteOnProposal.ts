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
        vote: Array.isArray(proposal)
            ? proposal.map((individualProposal) => ({
                  voter: context.wallet.drepId,
                  role: 'drep',
                  proposal: individualProposal,
                  vote: voteType,
                  anchor: anchorData,
              }))
            : {
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
        const filters = context.filter['proposalProcedures'] || context.filter['tx']['proposalProcedures']
        const voteTypeParam = context.parameters?.find((param) => param.name === 'voteType')
        const matchedFilterIndexes = filters.filter((i: any) => 'matchedIndex' in i)
        const ProposalIds = matchedFilterIndexes.length
            ? matchedFilterIndexes.map((p: any) => `${tx.hash.toString('hex')}#${p.matchedIndex ? p.matchedIndex : 0}`)
            : null
        return [
            {
                name: 'proposalIds',
                value: ProposalIds,
            },
            {
                name: 'anchor',
                value: {},
            },
            {
                name: 'voteType',
                value: voteTypeParam && voteTypeParam.value ? voteTypeParam.value : 'yes',
            },
        ]
    } catch (err) {
        if (!context.filter['proposalProcedures'] || !context.filter['tx']['proposalProcedures']) {
            console.error('VoteOnProposalFilterError : ' + 'proposalProcedure does not exist')
        } else {
            console.error('VoteOnProposalFilterError : ', err)
        }
        return null
    }
}
