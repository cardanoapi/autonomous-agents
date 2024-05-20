import sys
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException

from backend.app.models import TemplateCreateDto, TemplateResponse
from backend.app.models.template.template_dto import TemplateEditDto
from backend.config.database import prisma_connection
from backend.config.logger import logger


class TemplateRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_template(self, template_data: TemplateCreateDto):
        # Generate a random UUID for the template ID
        if template_data:
            logger.info(f"Saving template: {template_data}")
        template_id = str(uuid.uuid4())
        template_data_dict = {
            "id": template_id,
            "name": template_data.name,
            "description": template_data.description,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        template = await self.db.prisma.template.create(data=template_data_dict)
        template_response = {
            "id": template_id,
            "name": template_data.name,
            "description": template_data.description,
            "template_triggers": template_data.template_triggers,
        }

        return template_response

    async def retrieve_templates(self) -> List[TemplateResponse]:
        templates = await self.db.prisma.template.find_many(where={"deleted_at": None})
        if templates is None:
            raise HTTPException(status_code=404, detail="No templates not found")
        else:
            return templates

    async def retrieve_template(self, template_id: str) -> Optional[TemplateResponse]:
        template = await self.db.prisma.template.find_first(where={"id": template_id, "deleted_at": None})
        if template is None:
            raise HTTPException(status_code=404, detail="template not found")
        else:
            return template

    async def modify_template(self, template_id: str, template_data: TemplateEditDto):
        template = await self.db.prisma.template.find_first(where={"id": template_id})
        if template is None or template.deleted_at is not None:
            raise HTTPException(status_code=404, detail="template not found")

        updated_data = template_data.dict(exclude_unset=True)
        updated_data["updated_at"] = datetime.now(timezone.utc)

        updated_template = await self.db.prisma.template.update(where={"id": template_id}, data=updated_data)
        template_response = {
            "id": template_id,
            "name": template_data.name,
            "description": template_data.description
        }
        return template_response

    async def remove_template(self, template_id: str) -> bool:
        template = await self.db.prisma.template.find_first(where={"id": template_id})
        if template is None:
            return False
        elif template.deleted_at is not None:
            return True

        await self.db.prisma.template.update(
            where={"id": template_id},
            data={"deleted_at": datetime.now(timezone.utc)},
        )
        return True