from typing import Union, Optional
from pydantic import BaseModel, json
from croniter import croniter

from backend.app.exceptions import HTTPException


class CronTriggerDTO(BaseModel):
    frequency: str
    probability: float


class SubParameter(BaseModel):
    name: str
    value: str


class TopicTriggerDTO(BaseModel):
    topic: str
    parameter: Optional[list[SubParameter]]


class Action(BaseModel):
    function_name: str
    parameter: list[SubParameter]


class TriggerCreateDTO(BaseModel):
    type: str
    action: Optional[Action] = None
    data: Optional[Union[CronTriggerDTO, TopicTriggerDTO]] = None


# validation for cron expression
async def validate_type_CRON(cron_expression: str, probability: float):
    try:
        croniter(cron_expression)
    except ValueError as e:
        raise HTTPException(400, f"Invalid CRON expression")
        # Validate probability
    if probability < 0 or probability > 1:
        raise HTTPException(400, "Probability must be between 0 and 1 (inclusive)")


# validation for Topic
async def validate_type_TOPIC(value: str):
    try:
        if value.isnumeric():
            raise HTTPException(400, f"Invalid topic :")

    except ValueError as e:
        return f"Validation error: {e}"
