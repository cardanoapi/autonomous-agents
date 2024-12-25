from typing import Union, Optional, Any, Literal

from pydantic import BaseModel


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
ComparisonOperator = Literal["equals", "greaterthan", "lessthan", "in","gt","gte","lt","lte","ne","eq","contains"]


class Field(BaseModel):
    id: Union[str, list[str]]
    value: Any
    negate: bool
    operator: ComparisonOperator
    operators: list[ComparisonOperator]


class ChildrenFields(BaseModel):
    id: Optional[Union[str, list[str]]]
    children: list["FilterNode"]
    negate: bool
    operator: BooleanOperator


# FilterNode - recursive model
FilterNode = Union[Field, ChildrenFields]


class EventTriggerDTO(BaseModel):
    id: Optional[Union[str, list[str]]]
    children: Optional[list[FilterNode]]
    negate: Optional[bool]
    operator: Optional[BooleanOperator]


ChildrenFields.update_forward_refs()  # To allow model to reference another model that has not been defined yet


class TriggerCreateDTO(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union["CronTriggerDTO", "EventTriggerDTO"]] = None
