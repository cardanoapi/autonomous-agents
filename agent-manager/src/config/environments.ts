const environments = {
    kuberApiKey: process.env.KUBER_API_KEY || '',
    kuberBaseUrl: process.env.KUBER_BASE_URL || 'https://sanchonet.kuber.cardanoapi.io',
    blockFrostApiKey: process.env.BLOCKFROST_API_KEY || '',
    enableBlockFrostSubmitApi: process.env.ENABLE_BLOCKFROST_SUBMIT_API?.toLowerCase() === 'true',
    managerWalletAddress: process.env.MANAGER_WALLET_ADDRESS || '',
    managerWalletSigningKey: process.env.MANAGER_WALLET_SIGNING_KEY || '',
    agentMnemonic: process.env.AGENT_MNEMONIC || '',
    metaDataBaseURL: process.env.METADATA_BASE_URL || 'https://metadata.drep.id',
    dbSyncBaseUrl: process.env.DB_SYNC_BASE_URL || 'https://dbsyncapi.agents.cardanoapi.io/api',
    serverPort: process.env.SERVER_PORT || '3001',
    networkName: process.env.NETWORK_NAME || 'sanchonet',
    kafka: {
        topicPrefix: process.env.KAFKA_TOPIC_PREFIX || '',
        consumerGroup: process.env.KAFKA_CONSUMER_GROUP || '',
        prefix: process.env.KAFKA_PREFIX || 'local',
        brokers: process.env.KAFKA_BROKERS || '',
        clientId: process.env.KAFKA_CLIENT_ID || '',
    },
    faucet: {
        apiKey: process.env.FAUCET_API_KEY || '',
        url: process.env.FAUCET_URL || '',
    },
}

export default environments
