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
        "num_parameters": 1,
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
                "data_type": "url",
            },
            {
                "name": "anchor_dataHash",
                "description": "Anchor Data Hash",
                "optional": False,
                "data_type": "hex",
            },
            {
                "name": "newConstitution_url",
                "description": "New Constitution Url",
                "optional": False,
                "data_type": "url",
            },
            {
                "name": "newConstitution_dataHash",
                "description": "New Constitution Data Hash",
                "optional": False,
                "data_type": "hex",
            },
        ],
    },
    {
        "function_name": "Info Action Proposal",
        "num_parameters": 2,
        "parameters": [
            {
                "name": "anchor_url",
                "description": "Anchor Url",
                "optional": False,
                "data_type": "url",
            },
            {
                "name": "anchor_dataHash",
                "description": "Anchor Data Hash",
                "optional": False,
                "data_type": "url",
            },
        ],
    },
    {
        "function_name": "Delegation",
        "num_parameters": 3,
        "parameters": [
            {
                "name": "certificates_type",
                "description": "Type",
                "optional": False,
                "data_type": "CertificatesType",
            },
            {
                "name": "drep",
                "description": "Drep",
                "optional": False,
                "data_type": "Drep Hash",
            },
        ],
    },
    {
        "function_name": "Vote",
        "num_parameters": 3,
        "parameters": [
            {
                "name": "proposal",
                "description": "Proposal",
                "optional": False,
                "data_type": "proposal",
            },
            {
                "name": "anchor_url",
                "description": "Anchor Url",
                "optional": False,
                "data_type": "url",
            },
            {
                "name": "anchor_dataHash",
                "description": "Anchor Data Hash",
                "optional": False,
                "data_type": "hash",
            },
        ],
    },
]
