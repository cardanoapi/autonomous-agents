"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafka_event = void 0;
const kafkajs_1 = require("kafkajs");
const agent_manager_service_1 = __importDefault(require("./agent_manager_service"));
const brokerUrl = process.env.BROKER_URL || '';
const kafka = new kafkajs_1.Kafka({
    clientId: process.env["CLIENT_ID"],
    brokers: [brokerUrl] // Update with your Kafka broker address
});
const consumer = kafka.consumer({ groupId: 'trigger_consumer_group' });
// Initialize WebSocket manager
consumer.connect();
consumer.subscribe({ topic: 'trigger_config_updates', fromBeginning: true });
async function kafka_event() {
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            // Process message
            const agentId = message.key?.toString();
            if (agentId) {
                // Notify WebSocket manager about config update
                agent_manager_service_1.default.sendToWebSocket(agentId, { message: 'config_updated' });
            }
        },
    });
}
exports.kafka_event = kafka_event;
;
