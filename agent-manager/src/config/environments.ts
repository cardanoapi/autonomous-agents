const environments = {
    kuberApiKey: process.env.KUBER_API_KEY || '',
    kuberBaseUrl: process.env.KUBER_BASE_URL || 'https://sanchonet.kuber.cardanoapi.io',
    sanchonetFaucetApiKey: process.env.SANCHONET_FAUCET_API_KEY || '',
    managerWalletAddress: process.env.MANAGER_WALLET_ADDRESS || '',
    managerWalletSigningKey: process.env.MANAGER_WALLET_SIGNING_KEY || '',
}

export default environments
