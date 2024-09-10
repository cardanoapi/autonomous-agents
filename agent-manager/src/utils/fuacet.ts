import environments from '../config/environments'

export default function getFaucetAdaForAddress(address: string) {
    const url = new URL('https://faucet.sanchonet.world.dev.cardano.org/send-money')
    const params: Record<string, string> = {
        type: 'default',
        action: 'funds',
        address,
        api_key: environments.sanchonetFaucetApiKey,
    }

    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))

    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log('Response for faucet load', data)
            return data
        })
        .catch((error) => console.error('Error:', error))
}

export function fetchWalletBalance(address: string) {
    const url = environments.kuberBaseUrl + '/api/v3/utxo?address=' + address
    return fetch(url)
        .then((res) => res.json())
        .then((data: any) => {
            console.log(data)
            return data.reduce((totalVal: number, item: any) => totalVal + item.value.lovelace, 0) / 10 ** 6
        })
        .catch((error) => {
            throw error
        })
}
