from typing import Union
from pydantic import BaseModel, Json


class CronTriggerDTO(BaseModel):
    frequency: str
    probability: float


class TopicTriggerDTO(BaseModel):
    topic: str


class TriggerCreateDTO(BaseModel):
    type: str
    data: Union[CronTriggerDTO, TopicTriggerDTO]
    agent_id: str


class TriggerEditDTO(BaseModel):
    type: str
    data: Union[CronTriggerDTO, TopicTriggerDTO]
