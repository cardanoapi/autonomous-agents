from pydantic import BaseModel
from typing import Union


from backend.app.models.trigger.trigger_dto import Action, CronTriggerDTO, TopicTriggerDTO


class TriggerResponse(BaseModel):
    id: str
    agent_id: str
    type: str
    action: Action
    data: Union[CronTriggerDTO, TopicTriggerDTO]


# class TriggerResponse_agent_id(BaseModel):
#     agentId: str
#     type: str
#     data: Union[CronTriggerDTO, TopicTriggerDTO]
