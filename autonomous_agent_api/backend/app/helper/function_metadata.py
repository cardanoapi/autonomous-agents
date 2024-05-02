from typing import List

from pydantic import BaseModel


# Define models using Pydantic for parameter descriptions
class Parameter(BaseModel):
    name: str
    description: str
    optional: bool = False


class FunctionInfo(BaseModel):
    name: str
    num_parameters: int
    parameters: List[Parameter]


# Mock data for function metadata
functions_metadata = [
    {
        "name": "subtract",
        "num_parameters": 2,
        "parameters": [
            {"name": "a", "description": "First number", "optional": False},
            {"name": "b", "description": "Second number", "optional": False},
        ],
    },
    {
        "name": "add",
        "num_parameters": 2,
        "parameters": [
            {"name": "a", "description": "First number", "optional": False},
            {"name": "b", "description": "Second number", "optional": False},
        ],
    },
]
