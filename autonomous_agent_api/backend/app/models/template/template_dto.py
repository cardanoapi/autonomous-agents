from typing import List

from pydantic import BaseModel, Field

from backend.app.models import TriggerCreateDTO


class TemplateCreateDto(BaseModel):
    name: str = Field(..., description="Name of Template", min_length=1)
    description: str
    template_triggers: list[TriggerCreateDTO]


class TemplateEditDto(BaseModel):
    name: str = Field(..., description="Name of Template", min_length=1)
    description: str
