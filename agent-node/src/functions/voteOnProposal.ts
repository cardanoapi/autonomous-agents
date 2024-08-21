import { FunctionContext } from '../executor/BaseFunction'
import drepRegistration from './dRepRegistration'

export default async function handler(
    context: FunctionContext,
    proposal: string,
    anchorObj: Record<string, any>
) {
    const anchor = anchorObj.value || undefined
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal,
            vote: true,
            anchor: {
                url: anchor?.url || 'https://bit.ly/3zCH2HL',
                dataHash:
                    anchor?.dataHash ||
                    '1111111111111111111111111111111111111111111111111111111111111111',
            },
        },
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch(async (e) => {
            if (e.includes('VotersDoNotExist')) {
                await drepRegistration(context)
                    .then((v) => v)
                    .catch((e) => {
                        throw e
                    })
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
