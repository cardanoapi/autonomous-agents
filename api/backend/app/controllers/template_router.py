from http import HTTPStatus
from typing import List

from classy_fastapi import Routable, post, get, put, delete
from fastapi import Query

from backend.app.exceptions import HTTPException
from backend.app.models import TemplateCreateDto, TemplateResponse
from backend.app.models.template.template_dto import TemplateEditDto
from backend.app.services.template_service import TemplateService
from backend.dependency import template_service


class TemplateRouter(Routable):
    def __init__(self, template_service: TemplateService = template_service, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.template_service = template_service

    @post("/templates")
    async def create_template(self, template_data: TemplateCreateDto):
        template = await self.template_service.create_template(template_data)
        return template

    @get("/templates", response_model=List[TemplateResponse])
    async def list_templates(
        self,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, le=10),
    ):
        template = await self.template_service.list_templates(page, limit)
        return template

    @get("/templates/{template_id}", response_model=TemplateResponse)
    async def get_template_by_template_id(self, template_id: str):
        template = await self.template_service.get_template(template_id)
        return template

    @put("/templates/{template_id}", status_code=HTTPStatus.OK)
    async def update_template(self, template_id: str, template_data: TemplateEditDto):
        update_template = await self.template_service.update_template(template_id, template_data)
        return update_template

    @delete("/templates/{template_id}", status_code=HTTPStatus.NO_CONTENT)
    async def delete_template(self, template_id: str):
        await self.template_service.delete_template(template_id)
