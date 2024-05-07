from typing import Union

from pydantic import BaseModel

from backend.app.models import Action, CronTriggerDTO, TopicTriggerDTO


class TemplateTriggerResponse(BaseModel):
    id: str
    template_id: str
    type: str
    action: Action
    data: Union[CronTriggerDTO, TopicTriggerDTO]