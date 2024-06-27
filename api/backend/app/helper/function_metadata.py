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
        "function_name": "Drep Registration",
        "num_parameters": 0,
        "parameters": [],
        "description": "This will register you as Decentralized Representative (DRep) on the Cardano network.",
    },
    {
        "function_name": "Drep deRegistration",
        "num_parameters": 0,
        "parameters": [],
        "description": "This will retire you as Decentralized Representative (DRep) on the Cardano network.",
    },
    {
        "function_name": "Register Stake",
        "num_parameters": 0,
        "parameters": [],
        "description": "This will register you as Stake Pool Operator on the Cardano network.",
    },
    {
        "function_name": "Abstain Delegation",
        "num_parameters": 0,
        "parameters": [],
        "description": "This will delegate your voting rights to Abstain governance action which ensures your stake "
        "is excluded from the active voting stake but is"
        "registered for incentive purposes.",
    },
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
        "description": "Send the Ada to other Ada Holders in the cardano network.",
    },
    {
        "function_name": "Proposal New Constitution",
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
        "description": "Submit a new constitution for the Cardano network. Outline fundamental principles and "
        "guidelines to shape the ecosystem's future.",
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
        "description": "Submit a proposal to share crucial information or updates with the Cardano community to drive"
        " informed decision-making.",
    },
    {
        "function_name": "Delegation",
        "num_parameters": 3,
        "parameters": [
            {
                "name": "certificates_type",
                "description": "Certification Type",
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
        "description": "Delegate your voting power to a trusted DRep, allowing them to vote on governance decisions on "
        "your behalf.",
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
        "description": "Cast your vote on active governance proposals to influence key decisions within the Cardano "
        "ecosystem.",
    },
]
