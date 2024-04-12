import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Union
from fastapi import HTTPException
from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import (
    TriggerCreateDTO,
    CronTriggerDTO,
    TopicTriggerDTO,
    validate_type_CRON,
    validate_type_TOPIC,
)
from backend.config.database import prisma_connection


class TriggerRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO):
        trigger_id = str(uuid.uuid4())
        trigger_data_dict = trigger_data.dict()

        if trigger_data.type == "CRON":
            await validate_type_CRON(trigger_data.data.frequency)

        if trigger_data.type == "TOPIC":
            await validate_type_TOPIC(trigger_data.data.topic)

        # for config data
        data_dict = trigger_data_dict.pop("data")
        data_json = json.dumps(data_dict)

        # for Action Config
        action_dict = trigger_data_dict.pop("action")
        action_json = json.dumps(action_dict)

        trigger_data_dict["id"] = trigger_id
        trigger_data_dict["agent_id"] = agent_id
        trigger_data_dict["data"] = data_json
        trigger_data_dict["action"] = action_json
        trigger_data_dict["created_at"] = datetime.now(timezone.utc)
        trigger_data_dict["updated_at"] = datetime.now(timezone.utc)

        async with self.db:
            await self.db.prisma.trigger.create(data=trigger_data_dict)

        data_object = self._convert_data_to_dto(trigger_data.type, data_dict)

        trigger_response = TriggerResponse(
            id=trigger_id, agent_id=agent_id, type=trigger_data.type, data=data_object, action=trigger_data.action
        )
        return trigger_response

    async def retreive_triggers(self) -> List[TriggerResponse]:
        async with self.db:
            triggers = await self.db.prisma.trigger.find_many()
            return triggers

    async def retreive_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        async with self.db:
            triggers = await self.db.prisma.trigger.find_many(where={"agent_id": agent_id, "deleted_at": None})
            return triggers

    async def remove_trigger_by_trigger_id(self, trigger_id: str) -> bool:
        async with self.db:
            trigger = await self.db.prisma.trigger.find_first(where={"id": trigger_id})
            if trigger is None:
                return False
            elif trigger.deleted_at is not None:
                return True

            await self.db.prisma.trigger.update(
                where={"agent_id": trigger.agent_id, "id": trigger_id},
                data={"deleted_at": datetime.now(timezone.utc)},
            )
            return True

    async def retreive_trigger_by_id(self, trigger_id: str) -> Optional[TriggerResponse]:
        async with self.db:
            trigger = await self.db.prisma.trigger.find_first(where={"id": trigger_id, "deleted_at": None})
            if trigger is None:
                raise HTTPException(status_code=404, detail="Trigger not found")
            else:
                return trigger

    async def modify_trigger_by_id(self, trigger_id: str, trigger_data: TriggerCreateDTO) -> Optional[TriggerResponse]:
        async with self.db:
            trigger = await self.db.prisma.trigger.find_first(where={"id": trigger_id})
            if trigger is None or trigger.deleted_at is not None:
                raise HTTPException(status_code=404, detail="Trigger not found")
            updated_data_dict = trigger_data.dict()
            # for config data
            data_dict = updated_data_dict.pop("data")
            data_json = json.dumps(data_dict)
            # for action config
            action_dict = updated_data_dict.pop("action")
            action_json = json.dumps(action_dict)

            updated_data_dict["data"] = data_json
            updated_data_dict["action"] = action_json

            updated_data_dict["updated_at"] = datetime.now(timezone.utc)

            await self.db.prisma.trigger.update(where={"id": trigger_id}, data=updated_data_dict)

            # Create a TriggerResponse object with the converted data
            trigger_response = TriggerResponse(
                id=trigger_id,
                agent_id=trigger.agent_id,
                type=trigger_data.type,
                action=trigger_data.action,
                data=trigger_data.data,
            )
            return trigger_response

    def _convert_data_to_dto(self, trigger_type: str, data_dict: dict) -> Union[CronTriggerDTO, TopicTriggerDTO]:
        if trigger_type == "CRON":
            return CronTriggerDTO(**data_dict)
        elif trigger_type == "TOPIC":
            return TopicTriggerDTO(**data_dict)
        else:
            raise ValueError("Invalid trigger type")
