import { FunctionContext } from '../executor/BaseFunction'
import { bech32toHex } from '../utils/cardano'

export default async function handler(
    context: FunctionContext,
    withdrawal: Record<string, any>,
    anchor: Record<string, string>
) {
    const { dataHash, url } = await context.builtins.saveMetadata(
        context.helpers.generateProposalMetadataContent()
    )
    let updatedWithdrawal = withdrawal
    if (withdrawal) {
        const stakeKey = Object.keys(withdrawal)[0]
        if (stakeKey.startsWith('stake')) {
            const statkeKeyHex = bech32toHex(stakeKey)
            updatedWithdrawal = {
                ['e0' + statkeKeyHex]: withdrawal[stakeKey],
            }
        }
    }
    const anchorData =
        anchor && anchor['url'] && anchor['dataHash']
            ? anchor
            : { url, dataHash }
    const req = {
        proposals: [
            {
                anchor: anchorData,
                refundAccount: context.wallet.rewardAddress,
                withdraw: updatedWithdrawal,
                script: {
                    type: 'PlutusScriptV3',
                    description: '',
                    cborHex:
                        '5908545908510101003232323232323232323232323232323232323232323232323232323232323232323232323232323232259323255333573466e1d20000011180098111bab357426ae88d55cf00104554ccd5cd19b87480100044600422c6aae74004dd51aba1357446ae88d55cf1baa3255333573466e1d200a35573a002226ae84d5d11aab9e00111637546ae84d5d11aba235573c6ea800642b26006003149a2c8a4c301f801c0052000c00e0070018016006901e4070c00e003000c00d20d00fc000c0003003800a4005801c00e003002c00d20c09a0c80e1801c006001801a4101b5881380018000600700148013003801c006005801a410100078001801c006001801a4101001f8001800060070014801b0038018096007001800600690404002600060001801c0052008c00e006025801c006001801a41209d8001800060070014802b003801c006005801a410112f501c3003800c00300348202b7881300030000c00e00290066007003800c00b003482032ad7b806038403060070014803b00380180960003003800a4021801c00e003002c00d20f40380e1801c006001801a41403f800100a0c00e0029009600f0030078040c00e002900a600f003800c00b003301a483403e01a600700180060066034904801e00060001801c0052016c01e00600f801c006001801980c2402900e30000c00e002901060070030128060c00e00290116007003800c00b003483c0ba03860070018006006906432e00040283003800a40498003003800a404d802c00e00f003800c00b003301a480cb0003003800c003003301a4802b00030001801c01e0070018016006603490605c0160006007001800600660349048276000600030000c00e0029014600b003801c00c04b003800c00300348203a2489b00030001801c00e006025801c006001801a4101b11dc2df80018000c0003003800a4055802c00e007003012c00e003000c00d2080b8b872c000c0006007003801809600700180060069040607e4155016000600030000c00e00290166007003012c00e003000c00d2080c001c000c0003003800a405d801c00e003002c00d20c80180e1801c006001801a412007800100a0c00e00290186007003013c0006007001480cb005801801e006003801800e00600500403003800a4069802c00c00f003001c00c007003803c00e003002c00c05300333023480692028c0004014c00c00b003003c00c00f003003c00e00f003800c00b00301480590052008003003800a406d801c00e003002c00d2000c00d2006c00060070018006006900a600060001801c0052038c00e007001801600690006006901260003003800c003003483281300020141801c005203ac00e006027801c006001801a403d800180006007001480f3003801804e00700180060069040404af3c4e302600060001801c005203ec00e006013801c006001801a4101416f0fd20b80018000600700148103003801c006005801a403501c3003800c0030034812b00030000c00e0029021600f003800c00a01ac00e003000c00ccc08d20d00f4800b00030000c0000000000803c00c016008401e006009801c006001801807e0060298000c000401e006007801c0060018018074020c000400e00f003800c00b003010c000802180020070018006006019801805e0003000400600580180760060138000800c00b00330134805200c400e00300080330004006005801a4001801a410112f58000801c00600901260008019806a40118002007001800600690404a75ee01e00060008018046000801801e000300c4832004c025201430094800a0030028052003002c00d2002c000300648010c0092002300748028c0312000300b48018c0292012300948008c0212066801a40018000c0192008300a2233335573e00250002801994004d55ce800cd55cf0008d5d08014c00cd5d10011263009222532900389800a4d2219002912c80344c01526910c80148964cc04cdd68010034564cc03801400626601800e0071801226601800e01518010096400a3000910c008600444002600244004a664600200244246466004460044460040064600444600200646a660080080066a00600224446600644b20051800484ccc02600244666ae68cdc3801000c00200500a91199ab9a33710004003000801488ccd5cd19b89002001800400a44666ae68cdc4801000c00a00122333573466e20008006005000912a999ab9a3371200400222002220052255333573466e2400800444008440040026eb400a42660080026eb000a4264666015001229002914801c8954ccd5cd19b8700400211333573466e1c00c006001002118011229002914801c88cc044cdc100200099b82002003245200522900391199ab9a3371066e08010004cdc1001001c002004403245200522900391199ab9a3371266e08010004cdc1001001c00a00048a400a45200722333573466e20cdc100200099b820020038014000912c99807001000c40062004912c99807001000c400a2002001199919ab9a357466ae880048cc028dd69aba1003375a6ae84008d5d1000934000dd60010a40064666ae68d5d1800c0020052225933006003357420031330050023574400318010600a444aa666ae68cdc3a400000222c22aa666ae68cdc4000a4000226600666e05200000233702900000088994004cdc2001800ccdc20010008cc010008004c01088954ccd5cd19b87480000044400844cc00c004cdc300100091119803112c800c60012219002911919806912c800c4c02401a442b26600a004019130040018c008002590028c804c8888888800d1900991111111002a244b267201722222222008001000c600518000001112a999ab9a3370e004002230001155333573466e240080044600823002229002914801c88ccd5cd19b893370400800266e0800800e00100208c8c0040048c0088cc008008005',
                },
            },
        ],
    }
    return await context.wallet.buildAndSubmit(req, false)
}
