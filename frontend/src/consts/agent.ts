import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export const AGENT_TRIGGER = {
    stakeDelegation: {
        function_name: 'stakeDelegation',
        parameters: [
            {
                name: 'drep',
                description: 'Drep',
                optional: true,
                data_type: 'Drep Hash'
            },
            {
                name: 'pool',
                description: 'Stake Pool',
                optional: true,
                data_type: 'Drep Hash'
            }
        ]
    },
    voteOnProposal: {
        function_name: 'voteOnProposal',
        parameters: [
            {
                name: 'proposal',
                description: 'Proposal',
                optional: false,
                data_type: 'proposal'
            }
        ]
    },
    createInfoGovAction: {
        function_name: 'createInfoGovAction',
        parameters: [
            {
                name: 'anchor_url',
                description: 'Anchor Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'anchor_dataHash',
                description: 'Anchor Data Hash',
                optional: false,
                data_type: 'url'
            }
        ]
    },
    proposalNewConstitution: {
        function_name: 'proposalNewConstitution',
        parameters: [
            {
                name: 'anchor_url',
                description: 'Anchor Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'anchor_dataHash',
                description: 'Anchor Data Hash',
                optional: false,
                data_type: 'hex'
            },
            {
                name: 'newConstitution_url',
                description: 'New Constitution Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'newConstitution_dataHash',
                description: 'New Constitution Data Hash',
                optional: false,
                data_type: 'hex'
            }
        ]
    },
    transferADA: {
        function_name: 'transferADA',
        parameters: [
            {
                name: 'receiver_address',
                description: 'Ada holder Receiver Address',
                optional: false,
                data_type: 'string'
            },
            {
                name: 'receiving_ada',
                description: 'Receiving Ada Amount',
                optional: false,
                data_type: 'number'
            }
        ]
    }
} as Record<AgentTriggerFunctionType, IAgentTrigger>;

export const MapFunctionNameAndViewName: Record<string, string> = {
    transferADA: 'Transfer Ada',
    voteOnProposal: 'Vote',
    stakeDelegation: 'Stake Delegation',
    createInfoGovAction: 'Info Action Proposal',
    proposalNewConstitution: 'Proposal New Constitution',
    dRepRegistration: 'Drep Registration',
    dRepDeRegistration: 'Drep DeRegistration',
    registerStake: 'Stake Registration',
    stakeDeRegistration: 'Stake DeRegistration',
    abstainDelegation: 'Abstain Delegation',
    noConfidence: 'No Confidence',
    updateCommittee: 'Update Committee',
    treasuryWithdrawal: 'Treasury Withdrawal'
} as Record<string, string>;

export const AgentFunctions = [
    {
        function_name: 'transferADA',
        name: 'Transfer Ada',
        parameters: [
            {
                name: 'Receiver Address',
                description: 'Ada holder Receiver Address',
                optional: false,
                data_type: 'string'
            }
        ]
    },
    {
        name: 'Proposal New Constitution',
        function_name: 'proposalNewConstitution',
        parameters: [
            {
                name: 'anchor_url',
                description: 'Anchor Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'anchor_dataHash',
                description: 'Anchor Data Hash',
                optional: false,
                data_type: 'hex'
            },
            {
                name: 'newConstitution_url',
                description: 'New Constitution Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'newConstitution_dataHash',
                description: 'New Constitution Data Hash',
                optional: false,
                data_type: 'hex'
            }
        ]
    },
    {
        name: 'Info Action Proposal',
        function_name: 'createInfoGovAction',
        parameters: [
            {
                name: 'anchor_url',
                description: 'Anchor Url',
                optional: false,
                data_type: 'url'
            },
            {
                name: 'anchor_dataHash',
                description: 'Anchor Data Hash',
                optional: false,
                data_type: 'url'
            }
        ]
    },
    {
        name: 'Stake Delegation',
        function_name: 'stakeDelegation',
        parameters: [
            {
                name: 'drep',
                description: 'Drep',
                optional: true,
                data_type: 'Drep Hash'
            },
            {
                name: 'pool',
                description: 'Stake Pool',
                optional: true,
                data_type: 'Drep Hash'
            }
        ]
    },
    {
        name: 'Vote',
        function_name: 'voteOnProposal',
        parameters: [
            {
                name: 'proposal',
                description: 'Proposal',
                optional: false,
                data_type: 'proposal'
            },
            {
                name: 'anchor_url',
                description: 'Anchor Url',
                optional: true,
                data_type: 'url'
            },
            {
                name: 'anchor_dataHash',
                description: 'Anchor Data Hash',
                optional: true,
                data_type: 'hash'
            }
        ]
    }
];
