import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    proposal: Record<string, any>,
    anchorObj: Record<string, any>
) {
    const anchor = anchorObj.value ? anchorObj.value : undefined
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal: proposal.value,
            vote: true,
            anchor:
                anchorObj.value.url && anchor.value.dataHash
                    ? anchorObj.value
                    : {
                          url: 'https://bit.ly/3zCH2HL',
                          dataHash:
                              '1111111111111111111111111111111111111111111111111111111111111111',
                      },
        },
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
            if (e.includes('VotersDoNotExist')) {
                await context.builtins.dRepRegistration()
                // await drepRegistration(context)
                //     .then((v) => v)
                //     .catch((e) => {
                //         throw e
                //     })
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
