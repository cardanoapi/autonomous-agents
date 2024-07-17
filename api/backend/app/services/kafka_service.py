from aiokafka import AIOKafkaProducer
from backend.config import settings

from typing import Optional


class KafkaService:
    def __init__(
        self,
    ):
        if not settings.KAFKA_ENABLED:
            self.producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BROKERS)

    async def start(self):
        if settings.KAFKA_ENABLED:
            await self.producer.start()

    async def stop(self):
        if settings.KAFKA_ENABLED:
            await self.producer.stop()

    async def publish_message(self, topic: str, message: str, key: Optional[str]):
        if settings.KAFKA_ENABLED:
            await self.producer.send_and_wait(topic, message.encode("utf-8"), key=key.encode("utf-8"))
            await self.producer.flush()
