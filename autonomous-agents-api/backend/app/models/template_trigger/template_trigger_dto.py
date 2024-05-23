from typing import Union
from pydantic import BaseModel, Field

from backend.app.models import Action, CronTriggerDTO, TopicTriggerDTO


class TemplateTriggerCreateDto(BaseModel):
    type: str
    action: Action
    data: Union[CronTriggerDTO, TopicTriggerDTO]
