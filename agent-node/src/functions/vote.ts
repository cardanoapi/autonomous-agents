import { FunctionContext } from "./BaseFunction"

export default async function handler(
    context:FunctionContext,
    proposal: string,anchor:Record<string,string>){
    const req = {
        vote: {
            voter: context.wallet.drepId,
            role: 'drep',
            proposal,
            vote: true,
            anchor: {
                url: anchor?.url || 'https://bit.ly/3zCH2HL',
                dataHash: anchor?.dataHash || '1111111111111111111111111111111111111111111111111111111111111111',
            },
        },
    }
    return await context.wallet.buildAndSubmit(req).catch(e=>{
        
    })

}