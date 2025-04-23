import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Union

from backend.app.exceptions import HTTPException
from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import (
    TriggerCreateDTO,
    CronTriggerDTO,
    EventTriggerDTO,
)
from backend.config.database import prisma_connection
from backend.app.models.trigger.trigger_dto import EventTriggerDTO
from backend.config.logger import logger
from backend.app.models.trigger.utils import validate_type_CRON, validate_type_EVENT


class TriggerRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO):
        if trigger_data.type == "CRON":
            validate_type_CRON(trigger_data.data.frequency, trigger_data.data.probability)
        elif trigger_data.type == "EVENT":
            validate_type_EVENT(trigger_data.data)
        else:
            raise HTTPException(status_code=400, content=f"Invalid Trigger Type {trigger_data.type}")
        trigger_data_dict = trigger_data.dict()
        trigger_data_dict["id"] = str(uuid.uuid4())
        # for config data
        data_dict = trigger_data_dict.pop("data")
        data_json = json.dumps(data_dict)

        # for Action Config
        action_dict = trigger_data_dict.pop("action")
        action_json = json.dumps(action_dict)
        trigger_data_dict["agent_id"] = agent_id
        trigger_data_dict["data"] = data_json
        trigger_data_dict["action"] = action_json
        trigger_data_dict["created_at"] = datetime.now(timezone.utc)
        trigger_data_dict["updated_at"] = datetime.now(timezone.utc)

        trigger = await self.db.prisma.trigger.create(data=trigger_data_dict)

        data_object = self._convert_data_to_dto(trigger_data.type, data_dict)

        trigger_response = TriggerResponse(
            id=trigger.id,
            agent_id=agent_id,
            type=trigger_data.type,
            data=data_object,
            action=trigger_data.action,
        )
        return trigger_response

    async def retreive_triggers(self) -> List[TriggerResponse]:
        triggers = await self.db.prisma.trigger.find_many()
        return triggers

    async def retreive_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        triggers = await self.db.prisma.trigger.find_many(where={"agent_id": agent_id, "deleted_at": None})
        return triggers

    async def count_triggers_by_agent_id(self, agent_id: str) -> int:
        triggers = await self.db.prisma.trigger.count(where={"agent_id": agent_id, "deleted_at": None})
        return triggers

    async def remove_trigger_by_trigger_id(self, trigger_id: str) -> bool:
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
        trigger = await self.db.prisma.trigger.find_first(where={"id": trigger_id, "deleted_at": None})
        if trigger is None:
            raise HTTPException(status_code=404, content="Trigger not found")
        else:
            return trigger

    async def modify_trigger_by_id(self, trigger_id: str, trigger_data: TriggerCreateDTO) -> Optional[TriggerResponse]:
        trigger = await self.db.prisma.trigger.find_first(where={"id": trigger_id})
        if trigger is None or trigger.deleted_at is not None:
            raise HTTPException(status_code=404, content="Trigger not found")
        updated_data_dict = trigger_data.dict()

        # validation for CRON nad TOPIC
        if trigger_data.type == "CRON":
            validate_type_CRON(trigger_data.data.frequency, trigger_data.data.probability)

        if trigger_data.type == "EVENT":
            validate_type_EVENT(trigger_data.data)

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

    def _convert_data_to_dto(self, trigger_type: str, data_dict: dict) -> Union[CronTriggerDTO, EventTriggerDTO]:
        if trigger_type == "CRON":
            return CronTriggerDTO(**data_dict)
        elif trigger_type == "EVENT":
            return EventTriggerDTO(**data_dict)
        else:
            raise ValueError("Invalid trigger type")
