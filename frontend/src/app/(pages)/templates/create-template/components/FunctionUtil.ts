import { ICronTrigger, IEventTrigger } from '@api/agents';
import { IAgentAction } from '@api/agents';
import { ISubParameter } from '@api/agents';
import { ITriggerCreateDto } from '@api/trigger';
import { IParameter } from '@models/types/functions';

import { IConfiguredFunctionsItem } from '../page';

export const mapToTriggerCreateDTO = (
    //takes in Configured Functions item list and returns in ITrigger Create DTO
    data: IConfiguredFunctionsItem[]
): ITriggerCreateDto[] => {
    return data.map((item: IConfiguredFunctionsItem) => {
        return {
            type: item.type,
            action: {
                function_name: item.id,
                parameters: convertToNameValuePair(item.parameters || [])
            },
            data: {
                probability: (item.cronValue?.probability || 100) / 100,
                frequency: item.cronValue?.frequency || '* * * * *'
            }
        };
    });
};

const convertToNameValuePair = (data: IParameter[]): ISubParameter[] => {
    return data.map((param) => {
        if (param.parameters) {
            return {
                name: param.id,
                value: convertToKeyValuePairObject(param.parameters)
            };
        }
        return {
            name: param.name,
            value: param.value
        };
    });
};

const convertToKeyValuePairObject = (parameters: IParameter[]) => {
    const obj: { [key: string]: any } = {};
    parameters.forEach((param) => {
        obj[param.id] = param.value;
    });
    return obj;
};

const determineDataType = () => {
    return [];
};
