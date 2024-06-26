from typing import Union, Optional

from pydantic import BaseModel

from backend.app.models import Action, CronTriggerDTO, EventTriggerDTO


class TemplateTriggerResponse(BaseModel):
    id: str
    template_id: str
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, EventTriggerDTO]] = None
