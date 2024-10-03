import { ISubParameter } from '@api/agents';
import { ITriggerCreateDto } from '@api/trigger';
import { IParameter, IParameterOption } from '@models/types/functions';

import { IConfiguredFunctionsItem } from '../../page';

export const mapToTriggerCreateDTO = (
    data: IConfiguredFunctionsItem[]
): ITriggerCreateDto[] => {
    return data.map(mapConfiguredFunctionToTriggerCreateDTO);
};

const mapConfiguredFunctionToTriggerCreateDTO = (
    item: IConfiguredFunctionsItem
): ITriggerCreateDto => {
    const commonData = {
        probability: (item.cronValue?.probability || 100) / 100,
        frequency: item.cronValue?.frequency || '* * * * *'
    };

    if (item.type === 'EVENT') {
        return {
            type: item.type,
            action: {
                function_name: item.id,
                parameters: mapParamValueToKeyValuePair(item.eventParameters || [])
            },
            data: {
                event: 'VoteEvent',
                parameters: mapParamValueToKeyValuePair(item.eventParameters || [])
            }
        };
    }

    if (item.id === 'delegation') {
        return {
            type: item.type,
            action: {
                function_name: item.id,
                parameters: item.optionValue
                    ? [mapOptionToKeyValuePair(item.optionValue, 'delegation_params')]
                    : []
            },
            data: commonData
        };
    }

    return {
        type: item.type,
        action: {
            function_name: item.id,
            parameters: mapParamValueToKeyValuePair(item.parameters || [])
        },
        data: commonData
    };
};

const mapParamValueToKeyValuePair = (params: IParameter[]): ISubParameter[] => {
    return params.map((param) => ({
        name: param.id || param.name,
        value: param.parameters
            ? convertToKeyValuePairObject(param.parameters)
            : param.value
    }));
};

const convertToKeyValuePairObject = (params: IParameter[]): Record<string, any> => {
    return params.reduce(
        (obj, param) => {
            obj[param.id] = param.value;
            return obj;
        },
        {} as Record<string, any>
    );
};
const mapOptionToKeyValuePair = (
    option: IParameterOption,
    name = ''
): ISubParameter => {
    if (option.parameters) {
        return {
            name: name || option.name,
            value: convertToKeyValuePairObject(option.parameters)
        };
    }
    return {
        name: name || option.name,
        value: option.id
    };
};
