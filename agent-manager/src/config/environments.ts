const environments = {
    kuberApiKey: process.env.KUBER_API_KEY || '',
    kuberBaseUrl: process.env.KUBER_BASE_URL || 'https://sanchonet.kuber.cardanoapi.io/',
    sanchonetFaucetApiKey: process.env.SANCHONET_FAUCET_API_KEY || '',
    managerWalletAddress: process.env.MANAGER_WALLET_ADDRESS || '',
    managerWalletSigningKey: process.env.MANAGER_WALLET_SIGNING_KEY || '',
    agentMnemonic: process.env.AGENT_MNEMONIC || '',
    metaDataBaseURL: process.env.METADATA_BASE_URL || 'https://metadata.cardanoapi.io',
    dbSyncBaseUrl: process.env.DB_SYNC_BASE_URL || 'https://dbsyncapi.agents.cardanoapi.io/api/',
    kafkaTopicPrefix: process.env.KAFKA_TOPIC_PREFIX || '',
    kafkaConsumerGroup: process.env.KAFKA_CONSUMER_GROUP || '',
    kafkaPrefix: process.env.KAFKA_PREFIX || 'local',
    brokerUrl: process.env.KAFKA_BROKERS || '',
    clientId: process.env.CLIENT_ID || '',
}

export default environments
