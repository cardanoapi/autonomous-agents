import { Kafka, logLevel } from 'kafkajs';
import manager from "./agent_manager_service";

const brokerUrl = process.env.BROKER_URL || '';
const kafka = new Kafka({
  clientId: process.env["CLIENT_ID"],
  brokers: [brokerUrl] // Update with your Kafka broker address
});

const consumer = kafka.consumer({ groupId: 'trigger_consumer_group' });
 // Initialize WebSocket manager
 consumer.connect();
 consumer.subscribe({ topic: 'trigger_config_updates', fromBeginning: true });
export async function kafka_event(): Promise<void> {

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Process message
      const agentId = message.key?.toString();
      if (agentId) {
        // Notify WebSocket manager about config update
        manager.sendToWebSocket(agentId, { message: 'config_updated' });
      }
    },
  });
};