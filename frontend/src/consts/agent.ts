import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export const AGENT_TRIGGER: Record<AgentTriggerFunctionType, IAgentTrigger> = {
    Delegation: {
        function_name: 'Delegation',
        parameter: [
            {
                name: 'drep',
                description: 'Drep',
                optional: false,
                data_type: 'Drep Hash'
            }
        ]
    },
    Vote: {
        function_name: 'Vote',
        parameter: [
            {
                name: 'proposal',
                description: 'Proposal',
                optional: false,
                data_type: 'proposal'
            }
        ]
    },
    'Info Action Proposal': {
        function_name: 'Info Action Proposal',
        parameter: [
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
    'Proposal New Constitution': {
        function_name: 'Proposal New Constitution',
        parameter: [
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
    'SendAda Token': {
        function_name: 'SendAda Token',
        parameter: [
            {
                name: 'Receiver Address',
                description: 'Ada holder Receiver Address',
                optional: false,
                data_type: 'string'
            }
        ]
    }
};

export const AgentFunctions = [
    {
        function_name: 'SendAda Token',
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
        function_name: 'Proposal New Constitution',
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
        function_name: 'Info Action Proposal',
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
        function_name: 'Delegation',
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
        function_name: 'Vote',
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
