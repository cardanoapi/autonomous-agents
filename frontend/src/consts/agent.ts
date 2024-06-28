import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export const AGENT_TRIGGER: Record<AgentTriggerFunctionType, IAgentTrigger> = {
    Delegation: {
        function_name: 'Delegation',
        parameters: [
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
        parameters: [
            {
                name: 'proposal',
                description: 'Proposal',
                optional: false,
                data_type: 'proposal'
            }
        ]
    }
};
