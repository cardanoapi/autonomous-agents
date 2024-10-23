import datetime
import json
import uuid
from typing import List, Optional, Union
from datetime import datetime, timezone

from backend.app.exceptions import HTTPException
from prisma import Prisma

from backend.app.models import (
    validate_type_CRON,
    CronTriggerDTO,
    EventTriggerDTO,
    TemplateTriggerResponse,
    TemplateTriggerCreateDto,
    TriggerCreateDTO,
    validate_type_EVENT,
)
from backend.config.database import prisma_connection


class TemplateTriggerRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_template_trigger(self, transaction: Prisma, template_id: str, template_data: TriggerCreateDTO):
        template_trigger_id = str(uuid.uuid4())
        template_data_dict = template_data.dict()

        if template_data.type == "CRON":
            await validate_type_CRON(template_data.data.frequency, template_data.data.probability)
        elif template_data.type == "EVENT":
            await validate_type_EVENT(template_data.data.event)
        else:
            raise HTTPException(status_code=400, content=f"Invalid Trigger Type {template_data.type}")

        # for config data
        data_dict = template_data_dict.pop("data")
        data_json = json.dumps(data_dict)

        # for Action Config
        action_dict = template_data_dict.pop("action")
        action_json = json.dumps(action_dict)

        template_data_dict["id"] = template_trigger_id
        template_data_dict["template_id"] = template_id
        template_data_dict["data"] = data_json
        template_data_dict["action"] = action_json
        template_data_dict["created_at"] = datetime.now(timezone.utc)
        template_data_dict["updated_at"] = datetime.now(timezone.utc)

        # Use the transaction object for creating the trigger
        await transaction.template_trigger.create(data=template_data_dict)

        data_object = self._convert_data_to_dto(template_data.type, data_dict)

        template_response = TemplateTriggerResponse(
            id=template_trigger_id,
            template_id=template_id,
            type=template_data.type,
            data=data_object,
            action=template_data.action,
        )
        return template_response

    async def retrieve_templates_trigger(self) -> List[TemplateTriggerResponse]:
        templates = await self.db.prisma.template_trigger.find_many(where={"deleted_at": None})
        return templates

    async def retrieve_template_trigger(self, template_id: str) -> List[TemplateTriggerResponse]:
        template = await self.db.prisma.template_trigger.find_many(
            where={"template_id": template_id, "deleted_at": None}
        )
        return template

    async def modify_template_trigger(
        self, template_trigger_id: str, template_trigger_data: TemplateTriggerCreateDto
    ) -> Optional[TemplateTriggerResponse]:
        template_trigger = await self.db.prisma.template_trigger.find_first(where={"id": template_trigger_id})
        if template_trigger is None or template_trigger.deleted_at is not None:
            raise HTTPException(status_code=404, content="Template trigger not found")
        updated_data_dict = template_trigger_data.dict()

        # validation for CRON nad TOPIC
        if template_trigger_data.type == "CRON":
            await validate_type_CRON(template_trigger_data.data.frequency, template_trigger_data.data.probability)

        if template_trigger_data.type == "EVENT":
            await validate_type_EVENT(template_trigger_data.data.event)

        # for config data
        data_dict = updated_data_dict.pop("data")
        data_json = json.dumps(data_dict)
        # for action config
        action_dict = updated_data_dict.pop("action")
        action_json = json.dumps(action_dict)

        updated_data_dict["data"] = data_json
        updated_data_dict["action"] = action_json

        updated_data_dict["updated_at"] = datetime.now(timezone.utc)

        await self.db.prisma.template_trigger.update(where={"id": template_trigger_id}, data=updated_data_dict)

        # Create a TriggerResponse object with the converted data
        template_response = TemplateTriggerResponse(
            id=template_trigger_id,
            template_id=template_trigger.template_id,
            type=template_trigger_data.type,
            action=template_trigger_data.action,
            data=template_trigger_data.data,
        )
        return template_response

    async def remove_template_trigger(self, template_trigger_id: str):
        template = await self.db.prisma.template_trigger.find_first(where={"id": template_trigger_id})
        if template is None:
            return False
        elif template.deleted_at is not None:
            return True

        updated_template = await self.db.prisma.template_trigger.update(
            where={"id": template_trigger_id},
            data={"deleted_at": datetime.now(timezone.utc)},
        )
        return updated_template

    def _convert_data_to_dto(self, trigger_type: str, data_dict: dict) -> Union[CronTriggerDTO, EventTriggerDTO]:
        if trigger_type == "CRON":
            return CronTriggerDTO(**data_dict)
        elif trigger_type == "EVENT":
            return EventTriggerDTO(**data_dict)
        else:
            raise ValueError("Invalid trigger type")
