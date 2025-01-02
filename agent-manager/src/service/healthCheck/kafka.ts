import { kafka, topicList } from '../Listeners/KafkaMessageConsumer'

export async function checkKafkaStatus() {
    const admin = kafka.admin()
    try {
        // Connect to Kafka
        await admin.connect()

        // Fetch metadata
        const metadata = await admin.fetchTopicMetadata({ topics: [] })
        console.log('Metadata:', metadata)

        const clusterInfo = await admin.describeCluster()
        console.log('ClusterInfo : ', clusterInfo)

        // Optionally check for specific topics
        const missingTopics = topicList.filter((topic) => !metadata.topics.find((t: any) => t.name === topic))

        if (missingTopics.length > 0) {
            console.error('Missing topics:', missingTopics)
            return { status: 'error', message: `Missing topics: ${missingTopics.join(', ')}` }
        }

        return { status: 'ok', message: 'Kafka is in sync and working.' }
    } catch (error: any) {
        console.error('Error connecting to Kafka:', error)
        return { status: 'error', message: `Error: ${error.message}` }
    } finally {
        await admin.disconnect()
    }
}

// Example usage
checkKafkaStatus().then((status) => console.log('Kafka Status:', status))
