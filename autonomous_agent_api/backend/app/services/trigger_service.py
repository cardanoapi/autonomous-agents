import os
from typing import List, Union
from confluent_kafka import Producer
from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import (
    TriggerCreateDTO,
)
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.config.logger import logger


class TriggerService:
    def __init__(self, trigger_repository: TriggerRepository):
        self.trigger_repository = trigger_repository
        self.kafka_producer = Producer(
            {"bootstrap.servers": os.environ.get("KAFKA_BROKERS")}
        )

    async def create_trigger(
        self, agent_id: str, trigger_data: TriggerCreateDTO
    ) -> TriggerResponse:
        logger.info(self.kafka_producer)
        trigger_response = await self.trigger_repository.save_trigger(
            agent_id, trigger_data
        )

        self.publish_trigger_event(trigger_response.agent_id)

        return trigger_response

    async def list_triggers(self) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers()

    async def list_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers_by_agent_id(agent_id)

    async def delete_by_id(self, trigger_id: str) -> bool:
        return await self.trigger_repository.remove_trigger_by_trigger_id(trigger_id)

    async def list_trigger_by_id(self, trigger_id: str) -> TriggerResponse:
        return await self.trigger_repository.retreive_trigger_by_id(trigger_id)

    async def update_trigger_by_id(
        self, trigger_id: str, trigger_data: TriggerCreateDTO
    ) -> TriggerResponse:
        # Call the repository method to modify the trigger data
        trigger_response = await self.trigger_repository.modify_trigger_by_id(
            trigger_id, trigger_data
        )

        # Notify the change if necessary
        # Publish message to Kafka topic
        self.publish_trigger_event(trigger_response.agent_id)

        return trigger_response

    def publish_trigger_event(self, agent_id: str):
        def delivery_report(err, msg):
            """Called once for each message produced to indicate delivery result.
            Triggered by poll() or flush()."""
            if err is not None:
                logger.info("Message delivery failed: {}".format(err))
            else:
                logger.info(
                    "Message delivered to {} [{}]".format(msg.topic(), msg.partition())
                )

        # Publish message to Kafka topic
        self.kafka_producer.produce(
            "trigger_config_updates",
            key=agent_id.encode("utf-8"),
            value=b"config_updated",
            callback=delivery_report,
        )
        self.kafka_producer.flush()
