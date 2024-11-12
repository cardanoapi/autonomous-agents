from typing import Union, Optional, Any, Literal
from pydantic import BaseModel, json
from croniter import croniter

from backend.app.exceptions import HTTPException


class CronTriggerDTO(BaseModel):
    frequency: str
    probability: float


class SubParameter(BaseModel):
    name: str
    value: Any


# class EventTriggerDTO(BaseModel):
#     event: str
#     parameters: Optional[list[SubParameter]]


class Action(BaseModel):
    function_name: str
    parameters: list[SubParameter]


# For Event Based Trigger

BooleanOperator = Literal["AND", "OR"]
ComparisonOperator = Literal["equals", "greaterThan", "lessThan", "in"]


class Field(BaseModel):
    id: Union[str, list[str]]
    value: Any
    negate: bool
    operator: ComparisonOperator


class ChildrenFields(BaseModel):
    children: list["FilterNode"]
    negate: bool
    operator: BooleanOperator


# FilterNode - recursive model
FilterNode = Union[Field, ChildrenFields]


class EventTriggerDTO(BaseModel):
    id: Union[str, list[str]]
    parameters: list[FilterNode]
    negate: bool
    operator: BooleanOperator


ChildrenFields.update_forward_refs()  # To allow model to reference another model that has not been defined yet


class TriggerCreateDTO(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union["CronTriggerDTO", "EventTriggerDTO"]] = None
