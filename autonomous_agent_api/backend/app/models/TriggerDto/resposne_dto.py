from pydantic import BaseModel
from typing import Union

from backend.app.models.TriggerDto.trigger_dto import CronTriggerDTO, TopicTriggerDTO


class TriggerResponse(BaseModel):
    id: str
    agent_id: str
    type: str
    data: Union[CronTriggerDTO, TopicTriggerDTO]


# class TriggerResponse_agent_id(BaseModel):
#     agentId: str
#     type: str
#     data: Union[CronTriggerDTO, TopicTriggerDTO]
