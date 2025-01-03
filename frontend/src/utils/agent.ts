import { IAgent } from '@api/agents';
import { IParameter } from '@api/functions';
import { AGENT_TRIGGER } from '@consts';
import { AgentTriggerFunctionType, IAgentTrigger } from '@models/types';

export function isAgentActive({ last_active }: IAgent): boolean {
    if (!last_active) return false;

    const diffInSeconds = (new Date().getTime() - new Date(last_active).getTime()) / 1000;
    return diffInSeconds <= 33;
}

export function getConfiguredAgentTrigger(func: AgentTriggerFunctionType, value: string): IAgentTrigger {
    const trigger = AGENT_TRIGGER[func];

    if (!trigger) {
        throw new Error(`Unknown function type: ${func}`);
    }

    switch (func) {
        case 'delegation':
            return {
                ...trigger,
                parameters: [{ ...trigger.parameters[0], value: { drep: value } }]
            };

        case 'voteOnProposal':
            return { ...trigger, parameters: [{ ...trigger.parameters[0], value }] };

        default:
            return { ...trigger, parameters: [] };
    }
}

export function getFunctionParameters(function_name: AgentTriggerFunctionType) {
    const parameter = AGENT_TRIGGER[function_name]?.parameters;
    return parameter?.map((param) => ({
        name: param.name,
        description: param.description,
        value: ''
    }));
}

export function validateInputField(params: Array<IParameter>) {
    let isError = false;
    const errIndex: Array<number> = [];
    params.map((param: IParameter, index: number) => {
        if (param.data_type === 'group') {
            isError = !validateInputFieldForGroup(param);
            isError && errIndex.push(index);
        } else if (!param.optional && !param.value) {
            errIndex.push(index);
            isError = true;
        }
    });
    return { isError, errIndex };
}

export function validateInputFieldForGroup(param: IParameter) {
    if (!param.parameters?.length) {
        return false;
    }
    if (param.optional) {
        const isAnyFieldFilled =
            param.parameters?.some(
                (param) => param.value !== '' && param.value !== undefined && param.value !== null
            ) || false;
        if (isAnyFieldFilled) {
            return param.parameters.every((param: IParameter) => {
                if (!param.optional) {
                    return param.value !== '' && param.value !== undefined && param.value !== null;
                }
                return true;
            });
        }
        return true;
    } else {
        return param.parameters.every((param: IParameter) => {
            if (!param.optional) {
                return param.value !== '' && param.value !== undefined && param.value !== null;
            }
            return true;
        });
    }
}

export function formatDatetoHumanReadable(inputDate: string | number): string {
    if (inputDate === 'NA') {
        return 'Not activated yet';
    } else {
        const lastActiveDate = new Date(inputDate);
        const currentDate = new Date();

        const diffInSeconds = Math.floor((Number(currentDate) - Number(lastActiveDate)) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays >= 1) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours >= 1) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInMinutes >= 1) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`;
    }
}

export function formatParameterName(name: string) {
    const transformedName = name.replace('_', ' ');
    return transformedName
        .split(' ')
        .map((word) => {
            return word[0].toUpperCase() + word.substring(1);
        })
        .join(' ');
}
