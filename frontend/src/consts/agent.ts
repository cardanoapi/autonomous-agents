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
    }
};
