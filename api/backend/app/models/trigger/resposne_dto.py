from typing import Union, Optional, Any

from pydantic import BaseModel

from backend.app.models.trigger.trigger_dto import (
    Action,
    CronTriggerDTO,
)


class TriggerResponse(BaseModel):
    id: str
    agent_id: str
    type: str
    action: Optional[Action | Any] = None
    data: Optional[Union[CronTriggerDTO, Any]] = None


# class TriggerResponse_agent_id(BaseModel):
#     agentId: str
#     type: str
#     data: Union[CronTriggerDTO, TopicTriggerDTO]
