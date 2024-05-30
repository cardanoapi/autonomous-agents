from pydantic import BaseModel


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
