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
                function_name: item.name,
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
                name: param.name,
                parameters: convertToNameValuePair(param.parameters)
            };
        }
        return {
            name: param.name,
            value: param.value
        };
    });
};

const determineDataType = () => {
    return [];
};
