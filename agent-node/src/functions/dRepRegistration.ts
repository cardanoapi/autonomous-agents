import { FunctionContext } from '../executor/BaseFunction'

export default async function builtin(context: FunctionContext, anchor: any) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateDrepMetadataContent()
    )
    const anchorData =
        anchor && anchor['url'] && anchor['dataHash']
            ? anchor
            : { url, dataHash }
    const req = {
        certificates: [
            {
                type: 'registerdrep',
                key: context.wallet.stakeKey.pubKeyHash,
                anchor: anchorData,
            },
        ],
    }
    return await context.wallet
        .buildAndSubmit(req, true, true)
        .then((v) => {
            console.log('drepRegistration', v)
            return v
        })
        .catch((e) => {
            console.error('error', e)
            throw e
        })
}
