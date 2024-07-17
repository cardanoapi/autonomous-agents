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

export function validateInputFieldForGroup(param: IParameter) {
    if (!param.parameters?.length) {
        return false;
    }
    if (param.optional) {
        const isAnyFieldFilled =
            param.parameters?.some(
                (param) =>
                    param.value !== '' &&
                    param.value !== undefined &&
                    param.value !== null
            ) || false;
        if (isAnyFieldFilled) {
            return param.parameters.every((param: IParameter) => {
                if (!param.optional) {
                    return (
                        param.value !== '' &&
                        param.value !== undefined &&
                        param.value !== null
                    );
                }
                return true;
            });
        }
        return true;
    } else {
        return param.parameters.every((param: IParameter) => {
            if (!param.optional) {
                return (
                    param.value !== '' &&
                    param.value !== undefined &&
                    param.value !== null
                );
            }
            return true;
        });
    }
}
