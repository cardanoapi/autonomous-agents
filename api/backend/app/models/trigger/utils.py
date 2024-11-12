from backend.app.models.trigger.trigger_dto import EventTriggerDTO
from backend.app.exceptions import HTTPException
from croniter import croniter


def validate_type_EVENT(data: any):
    try:
        EventTriggerDTO.parse_raw(data.json())
    except Exception as e:
        raise HTTPException(
            status_code=402, content="Unprocessable Entity , Data is not an intatnce of Event Trigger Dto"
        )


def validate_type_CRON(cron_expression: str, probability: float):
    try:
        croniter(cron_expression)
    except ValueError as e:
        raise HTTPException(400, f"Invalid CRON expression")
        # Validate probability
    if probability < 0 or probability > 1:
        raise HTTPException(400, "Probability must be between 0 and 1 (inclusive)")
