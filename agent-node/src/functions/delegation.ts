import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    delegation: any
) {
    let certificateType = ''
    let drep = ''
    if (typeof delegation.value === 'string') {
        certificateType = delegation.value
        drep = context.wallet.drepId
    } else {
        certificateType = 'delegate'
        drep = delegation.value.drep
    }
    const req = {
        certificates: [
            {
                type: certificateType,
                key: context.wallet.paymentKey.pubKeyHash,
                drep: drep,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true)
        .then((v) => v)
        .catch((e) => {
            throw e
        })
}
