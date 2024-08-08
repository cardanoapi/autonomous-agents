export type ParameterType =
    | 'string'
    | 'number'
    | 'object'
    | 'options'
    | 'hash'
    | 'url'
    | 'list'
    | 'function';

type groupTypes = 'Certificates' | 'Vote' | 'Payment' | 'Governance Proposal';

export interface IFunctionsDto {
    group: groupTypes;
    items: IFunctionsItem[];
}

export interface IFunctionsItem {
    id: string;
    name: string;
    description: string;
    parameters?: IParameter[];
}

export interface IParameter {
    id: string;
    name: string;
    description?: string;
    type: ParameterType;
    optional?: boolean;
    options?: IParameterOption[];
    parameters?: IParameter[];
    items?: ItemObject[];
    value?: any;
}

export interface IParameterOption {
    id: string;
    name: string;
    type: ParameterType;
    parameters?: IParameter[];
}

export interface ItemObject {
    type: ParameterType;
    parameters?: IParameter[];
}

export const AvailableFunctions: IFunctionsDto[] = [
    {
        group: 'Certificates',
        items: [
            {
                id: 'dRepRegistration',
                name: 'DRep registration',
                description:
                    'This will register you as Decentralized Representative (DRep) on the Cardano network.'
            },
            {
                id: 'dRepDeRegistration',
                name: 'DRep de-registration',
                description:
                    'This will retire you as Decentralized Representative (DRep) on the Cardano network.'
            },
            {
                id: 'registerStake',
                name: 'Stake registration',
                description:
                    'This will register you as Stake Pool Operator on the Cardano network.'
            },
            {
                id: 'stakeDeRegistration',
                name: 'Stake de-registration',
                description:
                    'This will halt any further accumulation of staking rewards from the moment of deregistration.'
            },
            {
                id: 'delegation',
                name: 'Delegation',
                parameters: [
                    {
                        id: 'delegation_params',
                        name: 'Delegation Params',
                        type: 'options',
                        options: [
                            {
                                id: 'abstain',
                                name: 'Abstain',
                                type: 'function'
                            },
                            {
                                id: 'no-confidence',
                                name: 'No Confidence',
                                type: 'function'
                            },
                            {
                                id: 'specific',
                                name: 'Drep / Pool',
                                type: 'object',
                                parameters: [
                                    {
                                        id: 'drep',
                                        name: 'DRep',
                                        optional: true,
                                        type: 'hash'
                                    },
                                    {
                                        id: 'pool',
                                        name: 'Stake Pool',
                                        optional: true,
                                        type: 'hash'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                description:
                    'This will delegate your voting rights to Abstain governance action which ensures your stake is excluded from the active voting stake but is registered for incentive purposes.'
            }
        ]
    },
    {
        group: 'Vote',
        items: [
            {
                id: 'voteOnProposal',
                name: 'Vote On Proposal',
                description:
                    'Cast your vote on active governance proposals to influence key decisions within the Cardano ecosystem.',
                parameters: [
                    {
                        id: 'proposal',
                        name: 'Proposal',
                        optional: false,
                        type: 'string'
                    },
                    {
                        id: 'anchor',
                        type: 'object',
                        optional: true,
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                optional: false,
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                optional: false,
                                type: 'hash'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        group: 'Payment',
        items: [
            {
                id: 'transferADA',
                name: 'Transfer Ada',
                parameters: [
                    {
                        id: 'receiver_address',
                        name: 'Ada holder Receiver Address',
                        type: 'string',
                        optional: false
                    },
                    {
                        id: 'receiving_ada',
                        name: 'Receiving Ada Amount',
                        type: 'number',
                        optional: false
                    }
                ],
                description: 'Send the Ada to other Ada Holders in the cardano network.'
            }
        ]
    },
    {
        group: 'Governance Proposal',
        items: [
            {
                id: 'proposalNewConstitution',
                name: 'Constitution',
                parameters: [
                    {
                        id: 'anchor',
                        type: 'object',
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                type: 'hash'
                            }
                        ]
                    },
                    {
                        id: 'newConstitution',
                        type: 'object',
                        optional: false,
                        name: 'Constitution',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                optional: false,
                                type: 'hash'
                            }
                        ]
                    },
                    {
                        id: 'guardrailScript',
                        name: 'Guardrail Script Hash',
                        type: 'string',
                        optional: true
                    }
                ],
                description:
                    "Submit a new constitution for the Cardano network. Outline fundamental principles and guidelines to shape the ecosystem's future."
            },
            {
                id: 'createInfoGovAction',
                name: 'Info',
                parameters: [
                    {
                        id: 'anchor',
                        type: 'object',
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                type: 'hash'
                            }
                        ]
                    }
                ],
                description:
                    'Submit a proposal to share crucial information or updates with the Cardano community to drive informed decision-making.'
            },
            {
                id: 'treasuryWithdrawal',
                name: 'Treasury Withdrawal',
                parameters: [
                    {
                        id: 'withdrawal',
                        type: 'list',
                        name: 'Withdrawal',
                        items: [
                            {
                                type: 'object',
                                parameters: [
                                    {
                                        id: 'stakeAddress',
                                        name: 'Stake Address',
                                        type: 'string'
                                    },
                                    {
                                        id: 'amount',
                                        name: 'Amount',
                                        type: 'number'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'anchor',
                        type: 'object',
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                type: 'hash'
                            }
                        ]
                    }
                ],
                description: 'Propose Withdrawal from treasury'
            },
            {
                id: 'noConfidence',
                name: 'No Confidence',
                parameters: [
                    {
                        id: 'anchor',
                        type: 'object',
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                type: 'hash'
                            }
                        ]
                    }
                ],
                description:
                    'Propose no confidence on the current constitutional committee'
            },
            {
                id: 'updateCommittee',
                name: 'Update Committee',
                parameters: [
                    {
                        id: 'anchor',
                        type: 'object',
                        name: 'Anchor',
                        parameters: [
                            {
                                id: 'url',
                                name: 'Url',
                                type: 'url'
                            },
                            {
                                id: 'dataHash',
                                name: 'Data Hash',
                                type: 'hash'
                            }
                        ]
                    },
                    {
                        id: 'quorum',
                        name: 'Quorum',
                        type: 'object',
                        parameters: [
                            {
                                id: 'numerator',
                                name: 'Numerator',
                                type: 'number'
                            },
                            {
                                id: 'denominator',
                                name: 'Denominator',
                                type: 'number'
                            }
                        ]
                    },
                    {
                        id: 'add',
                        name: 'Add',
                        type: 'list',
                        optional: true,
                        items: [
                            {
                                type: 'object',
                                parameters: [
                                    {
                                        id: 'credential',
                                        name: 'Stake Address / Key Hash',
                                        type: 'string'
                                    },
                                    {
                                        id: 'active_epoch',
                                        name: 'Active Epoch',
                                        type: 'number'
                                    }
                                ]
                            }
                        ],
                        description: 'Add to Committee'
                    },
                    {
                        id: 'remove',
                        name: 'Remove',
                        type: 'list',
                        optional: true,
                        items: [
                            {
                                type: 'string',
                                parameters: [
                                    {
                                        id: 'credential',
                                        name: 'Stake Address / Key Hash',
                                        type: 'string'
                                    }
                                ]
                            }
                        ],
                        description: 'RemoveFrom Committee'
                    }
                ],
                description:
                    'Propose no confidence on the current constitutional committee'
            }
        ]
    }
];
