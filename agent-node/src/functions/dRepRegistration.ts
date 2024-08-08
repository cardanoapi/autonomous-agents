
import { FunctionContext } from "../executor/BaseFunction"

export function myTest(){

}

export default async function handler(context:FunctionContext,){

    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey,
                anchor: {
                    url: 'https://bit.ly/3zCH2HL',
                    dataHash:
                        '1111111111111111111111111111111111111111111111111111111111111111',
                },
            }
        ],
    }
    await context.builtins.waitTxConfirmation(txId,2);


    return await context.wallet.buildAndSubmit(req).then(v=>console.log("then",v)).catch(e=>{
        console.error("erro",e)
        throw e
    })
}

