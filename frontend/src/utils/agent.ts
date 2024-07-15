import { IAgent } from '@api/agents';
import { AGENT_TRIGGER } from '@consts';
import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export function isAgentActive({ last_active }: IAgent): boolean {
    if (!last_active) return false;

    const diffInSeconds =
        (new Date().getTime() - new Date(last_active).getTime()) / 1000;
    return diffInSeconds <= 33;
}

export function getConfiguredAgentTrigger(
    func: AgentTriggerFunctionType,
    value: string
): IAgentTrigger {
    const trigger = AGENT_TRIGGER[func];

    if (!trigger) {
        throw new Error(`Unknown function type: ${func}`);
    }

    switch (func) {
        case 'stakeDelegation':
            return { ...trigger, parameters: [{ ...trigger.parameters[0], value }] };

        case 'voteOnProposal':
            return { ...trigger, parameters: [{ ...trigger.parameters[0], value }] };

        default:
            return { ...trigger, parameters: [] };
    }
}
