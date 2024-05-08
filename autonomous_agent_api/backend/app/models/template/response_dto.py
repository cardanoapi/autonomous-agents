import json

from prisma import Json
from pydantic import BaseModel

from backend.app.models import TemplateTriggerResponse


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
