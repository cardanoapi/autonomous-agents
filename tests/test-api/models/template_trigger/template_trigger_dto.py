from typing import Union, Optional
from pydantic import BaseModel, Field

from models import Action, CronTriggerDTO, EventTriggerDTO


class TemplateTriggerCreateDto(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, EventTriggerDTO]] = None
