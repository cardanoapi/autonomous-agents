import { consumer, fetchConsumerLatestHeartbeat } from '../Listeners/KafkaMessageConsumer'

export async function checkKafkaStatus() {
    try {
        const lastHeartbeat = fetchConsumerLatestHeartbeat()
        const isHealthy = async () => {
            // so it is healthy
            if (Date.now() - lastHeartbeat < 10000) {
                return true
            }

            try {
                const { state } = await consumer.describeGroup()
                return ['CompletingRebalance', 'PreparingRebalance'].includes(state)
            } catch (err) {
                return false
            }
        }
        return isHealthy()
    } catch (error: any) {
        throw new Error('Error connecting to Kafka:', error.message ? error.message : error)
    }
}
