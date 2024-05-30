from http import HTTPStatus
from typing import List

from classy_fastapi import Routable, post, get, put, delete

from backend.app.models import TemplateTriggerCreateDto, TemplateTriggerResponse
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.dependency import get_template_trigger_service


class TemplateTriggerRouter(Routable):
    def __init__(
        self,
        template_trigger_service: TemplateTriggerService = get_template_trigger_service(),
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.template_trigger_service = template_trigger_service

    # @post("/templates/trigger", status_code=HTTPStatus.CREATED)
    # async def create_template_trigger(self, template_data: TemplateTriggerCreateDto):
    #     template = await self.template_trigger_service.create_template_trigger( template_data)
    #     return template

    @get("/templates/trigger", response_model=List[TemplateTriggerResponse])
    async def list_templates_trigger(self):
        template = await self.template_trigger_service.list_templates_trigger()
        return template

    @get(
        "/templates/{template_id}/trigger", response_model=List[TemplateTriggerResponse]
    )
    async def get_template_trigger_by_template_id(self, template_id: str):
        template = await self.template_trigger_service.get_template_trigger(template_id)
        return template

    @put("/templates/{trigger_id}/trigger", status_code=HTTPStatus.OK)
    async def update_template_trigger(
        self, template_trigger_id: str, template_data: TemplateTriggerCreateDto
    ):
        update_template = await self.template_trigger_service.update_template_trigger(
            template_trigger_id, template_data
        )
        return update_template

    @delete("/templates/{trigger_id}/trigger", status_code=HTTPStatus.NO_CONTENT)
    async def delete_template_trigger(self, template_trigger_id: str):
        await self.template_trigger_service.delete_template_trigger(template_trigger_id)
