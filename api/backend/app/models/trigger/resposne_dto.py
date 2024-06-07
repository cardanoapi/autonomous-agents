from pydantic import BaseModel
from typing import Union, Optional

from backend.app.models.trigger.trigger_dto import (
    Action,
    CronTriggerDTO,
    TopicTriggerDTO,
)


class TriggerResponse(BaseModel):
    id: str
    agent_id: str
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, TopicTriggerDTO]] = None


# class TriggerResponse_agent_id(BaseModel):
#     agentId: str
#     type: str
#     data: Union[CronTriggerDTO, TopicTriggerDTO]