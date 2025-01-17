import asyncio

from aiokafka import AIOKafkaProducer, AIOKafkaConsumer, TopicPartition

from backend.config import settings

from typing import Optional
from backend.config.api_settings import api_settings


class KafkaService:
    def __init__(
        self,
    ):
        if settings.KAFKA_ENABLED:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BROKERS,
                client_id="auto-agents-api",
            )

            self.consumer = AIOKafkaConsumer(
                api_settings.getKafkaTopicPrefix() + "-triggers",
                bootstrap_servers=settings.KAFKA_BROKERS,
                group_id=f"{api_settings.getKafkaTopicPrefix()}-heartbeat-check-group",
            )

    async def start(self):
        if settings.KAFKA_ENABLED:
            prefix = api_settings.getKafkaTopicPrefix()
            print(
                "starting kafka : brokers=",
                settings.KAFKA_BROKERS,
                "topics=",
                [prefix + "-triggers", prefix + "-updates"],
            )
            await self.producer.start()

            self.consumer.subscribe(
                topics=[prefix + "-triggers"],
            )

            await self.consumer.start()

    async def stop(self):
        if settings.KAFKA_ENABLED:
            await self.producer.stop()
            await self.consumer.stop()

    async def publish_message(self, topic: str, message: str, key: Optional[str]):
        if settings.KAFKA_ENABLED:
            print("publishing kafka message", topic, message.encode("utf-8"))
            await self.producer.send_and_wait(topic, message.encode("utf-8"), key=key.encode("utf-8"))
            await self.producer.flush()

    async def fetch_latest_poll_timestamp(self):
        """
        Monitor consumer health by checking last poll timestamp
        """
        prefix = api_settings.getKafkaTopicPrefix()

        try:
            message = self.consumer.last_poll_timestamp(
                partition=TopicPartition(topic=prefix + "-triggers", partition=0)
            )
            return message
        except asyncio.TimeoutError:
            print("No messages received, but consumer is alive.")
            return None
        except Exception as e:
            print(f"Error in consumer loop: {e}")
            return None
