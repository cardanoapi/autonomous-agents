from typing import List

from pydantic import BaseModel

functions_metadata = {
    "DeRegistration": [
        {
            "name": "Drep deRegistration",
            "function_name": "dRepDeRegistration",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will retire you as Decentralized Representative (DRep) on the Cardano network.",
        },
        {
            "name": "Stake deRegistration",
            "function_name": "stakeDeRegistration",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will halt any further accumulation of staking rewards from the moment of deregistration.",
        },
    ],
    "Registration": [
        {
            "function_name": "dRepRegistration",
            "name": "Drep Registration",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will register you as Decentralized Representative (DRep) on the Cardano network.",
        },
        {
            "name": "Stake Registration",
            "function_name": "registerStake",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will register you as Stake Pool Operator on the Cardano network.",
        },
    ],
    "Delegation": [
        {
            "name": "Abstain Delegation",
            "function_name": "abstainDelegation",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will delegate your voting rights to Abstain governance action which ensures your stake "
            "is excluded from the active voting stake but is"
            "registered for incentive purposes.",
        },
        {
            "name": "No Confidence",
            "function_name": "noConfidence",
            "num_parameters": 0,
            "parameters": [],
            "description": "This will allow stakeholders to express a lack of confidence in the current governance "
            "structure potentially leading to changes to "
            "address the concerns raised by the community.",
        },
        {
            "name": "Stake Delegation",
            "function_name": "stakeDelegation",
            "num_parameters": 3,
            "parameters": [
                {
                    "name": "drep",
                    "description": "Drep",
                    "optional": True,
                    "data_type": "Drep Hash",
                },
                {
                    "name": "pool",
                    "description": "Stake Pool",
                    "optional": True,
                    "data_type": "Drep Hash",
                },
            ],
            "description": "Delegate your voting power to a trusted DRep, allowing them to vote on governance decisions on "
            "your behalf.",
        },
    ],
    "Vote": [
        {
            "name": "Vote",
            "function_name": "voteOnProposal",
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
                    "optional": True,
                    "data_type": "url",
                },
                {
                    "name": "anchor_dataHash",
                    "description": "Anchor Data Hash",
                    "optional": True,
                    "data_type": "hash",
                },
            ],
            "description": "Cast your vote on active governance proposals to influence key decisions within the Cardano "
            "ecosystem.",
        },
    ],
    "Proposal": [
        {
            "name": "Proposal New Constitution",
            "function_name": "proposalNewConstitution",
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
            "name": "Info Action Proposal",
            "function_name": "createInfoGovAction",
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
    ],
    "Others": [
        {
            "name": "Transfer Ada",
            "function_name": "transferADA",
            "num_parameters": 1,
            "parameters": [
                {
                    "name": "receiver_address",
                    "description": "Ada holder Receiver Address",
                    "optional": False,
                    "data_type": "string",
                },
                {
                    "name": "receiving_ada",
                    "description": "Receiving Ada Amount",
                    "optional": False,
                    "data_type": "number",
                },
            ],
            "description": "Send the Ada to other Ada Holders in the cardano network.",
        }
    ],
}
