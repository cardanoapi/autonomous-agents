from typing import List

from pydantic import BaseModel


class Parameter(BaseModel):
    name: str
    description: str
    optional: bool = False
    data_type: str
    value: int = 0


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
            {
                "name": "a",
                "description": "First number",
                "optional": False,
                "data_type": "int",
            },
            {
                "name": "b",
                "description": "Second number",
                "optional": False,
                "data_type": "int",
            },
        ],
    },
    {
        "name": "add",
        "num_parameters": 2,
        "parameters": [
            {
                "name": "a",
                "description": "First number",
                "optional": False,
                "data_type": "int",
            },
            {
                "name": "b",
                "description": "Second number",
                "optional": False,
                "data_type": "int",
            },
        ],
    },
]
