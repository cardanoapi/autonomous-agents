import environments from '../config/environments'

const url = new URL(environments.faucet.url || 'https://faucet.sanchonet.world.dev.cardano.org/send-money')
const apiKey=  environments.faucet.apiKey
export const faucetEnabled=!!(url || apiKey)


export default async function getFaucetAdaForAddress(address: string) {
    if(!faucetEnabled){
        throw new Error("Faucet is not enabled.")
    }
    const params: Record<string, string> = {
        type: 'default',
        action: 'funds',
        address,
        api_key:apiKey
    }

    Object.keys(params).forEach((key) => url!.searchParams.append(key, params[key]))

    return fetch(url!)
        .then((response) => response.json())
        .then((data) => {
            return data
        })
        .catch((error) => {
            throw error
        })
}

export async function fetchWalletBalance(address: string) {
    const kuberUrl = environments.kuberBaseUrl
    if (!kuberUrl) return 0
    const url = kuberUrl + '/api/v3/utxo?address=' + address
    return fetch(url)
        .then((res) => res.json())
        .then((data: any) => {
            return data.reduce((totalVal: number, item: any) => totalVal + item.value.lovelace, 0) / 10 ** 6
        })
        .catch((error) => {
            throw error
        })
}
