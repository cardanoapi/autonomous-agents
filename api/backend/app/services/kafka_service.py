from aiokafka import AIOKafkaProducer
from backend.config import settings

from typing import Optional


class KafkaService:
    def __init__(
        self,
    ):
        self.producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BROKERS)

    async def start(self):

        await self.producer.start()

    async def stop(self):
        await self.producer.stop()

    async def publish_message(self, topic: str, message: str, key: Optional[str]):
        await self.producer.send_and_wait(topic, message.encode("utf-8"), key=key.encode("utf-8"))
        await self.producer.flush()
