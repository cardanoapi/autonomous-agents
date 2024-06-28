import { IAgent } from '@api/agents';
import { IParameter } from '@api/functions';
import { AGENT_TRIGGER } from '@consts';
import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export function isAgentActive({ last_active }: IAgent): boolean {
    if (!last_active) return false;

    const diffInSeconds =
        (new Date().getTime() - new Date(last_active).getTime()) / 1000;
    return diffInSeconds <= 33;
}

interface ConfiguredAgentTrigger extends Omit<IAgentTrigger, 'parameters'> {
    parameter: IParameter[];
}

export function getConfiguredAgentTrigger(
    func: AgentTriggerFunctionType,
    value: string
): ConfiguredAgentTrigger {
    const trigger = AGENT_TRIGGER[func];

    if (!trigger) {
        throw new Error(`Unknown function type: ${func}`);
    }

    switch (func) {
        case 'Delegation':
            return { ...trigger, parameter: [{ ...trigger.parameters[0], value }] };

        case 'Vote':
            return { ...trigger, parameter: [{ ...trigger.parameters[0], value }] };

        default:
            return { ...trigger, parameter: [] };
    }
}
