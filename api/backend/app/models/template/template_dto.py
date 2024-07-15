from typing import List, Optional

from pydantic import BaseModel, Field

from backend.app.models import TriggerCreateDTO, TemplateTriggerResponse


class TemplateCreateDto(BaseModel):
    userAddress: str
    name: str = Field(..., description="Name of Template", min_length=1)
    description: str
    template_triggers: list[TriggerCreateDTO]


class TemplateEditDto(BaseModel):
    userAddress: str
    name: str = Field(..., description="Name of Template", min_length=1)
    description: str
    template_configurations: Optional[List[TemplateTriggerResponse]]
