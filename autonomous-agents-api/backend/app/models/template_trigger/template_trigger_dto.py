from typing import Union, Optional
from pydantic import BaseModel, Field

from backend.app.models import Action, CronTriggerDTO, TopicTriggerDTO


class TemplateTriggerCreateDto(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, TopicTriggerDTO]] = None
