from typing import Optional, List

from pydantic import BaseModel

from backend.app.models import TemplateTriggerResponse


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str


class TemplateResponseWithConfigurations(TemplateResponse):
    template_configurations: Optional[List[TemplateTriggerResponse]]
