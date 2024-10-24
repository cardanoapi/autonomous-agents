from aiokafka import AIOKafkaProducer
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

    async def stop(self):
        if settings.KAFKA_ENABLED:
            await self.producer.stop()

    async def publish_message(self, topic: str, message: str, key: Optional[str]):
        if settings.KAFKA_ENABLED:
            print("publishing kafka message", topic, message.encode("utf-8"))
            await self.producer.send_and_wait(topic, message.encode("utf-8"), key=key.encode("utf-8"))
            await self.producer.flush()
