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
