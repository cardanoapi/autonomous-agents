from typing import List

from pydantic import BaseModel


# class Parameter(BaseModel):
#     name: str
#     description: str
#     optional: bool = False
#     data_type: str
#     value: int = 0
#
#
# class FunctionInfo(BaseModel):
#     name: str
#     num_parameters: int
#     parameters: List[Parameter]


# Mock data for function metadata
functions_metadata = [
    {
        "function_name": "SendAda Token",
        "parameters": [
            {
                "name": "Receiver Address",
                "description": "Ada holder Receiver Address",
                "optional": False,
                "data_type": "string",
            }
        ],
    },
    {
        "function_name": "Proposal New Constituion",
        "num_parameters": 4,
        "parameters": [
            {
                "name": "anchor_url",
                "description": "Anchor Url",
                "optional": False,
                "data_type": "",
            },
            {
                "name": "anchor_dataHash",
                "description": "Anchor Data Hash",
                "optional": False,
                "data_type": "",
            },
            {
                "name": "newConstitution_url",
                "description": "Anchor Url",
                "optional": False,
                "data_type": "",
            },
            {
                "name": "newConstitution_dataHash",
                "description": "Anchor Data Hash",
                "optional": False,
                "data_type": "",
            },
        ],
    },
]
