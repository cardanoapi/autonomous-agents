from typing import Union, Optional, List
from pydantic import BaseModel, json


class CronTriggerDTO(BaseModel):
    frequency: str
    probability: float


class SubParameter(BaseModel):
    name: str
    value: Optional[str] | List


class EventTriggerDTO(BaseModel):
    event: str
    parameters: Optional[list[SubParameter]]


class Action(BaseModel):
    function_name: str
    parameters: list[SubParameter]


class TriggerCreateDTO(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, EventTriggerDTO]] = None
