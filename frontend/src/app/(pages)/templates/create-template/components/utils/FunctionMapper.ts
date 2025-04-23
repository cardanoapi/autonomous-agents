import { IAgentConfiguration, IEventTrigger, ISubParameter } from '@api/agents';
import { TriggerType } from '@api/agents';
import { ICronTrigger } from '@api/agents';
import { ITemplateConfiguration } from '@api/templates';
import { ITriggerCreateDto } from '@api/trigger';
import { IParameter, IParameterOption, TemplateFunctions } from '@models/types/functions';

import { IFormFunctionInstance } from '../../page';
import {
    mapKeyValuePairToParamValue, // mapKeyValuePairToParamValue,
    mapOptionToKeyValuePair,
    mapParamValueToKeyValuePair
} from './MapperHelper';

// For converting function data from form to Trigger Create DTO Format.
export const mapFormFunctionToTriggerConfiguration = (item: IFormFunctionInstance): ITriggerCreateDto => {
    const commonData = {
        probability: (item.cronValue?.probability || 100) / 100,
        frequency: item.cronValue?.frequency || '* * * * *'
    };

    if (item.type === 'EVENT') {
        if (item.eventValue) {
            return {
                type: item.type,
                action: {
                    function_name: item.id,
                    parameters: item.optionValue ? [mapOptionToKeyValuePair(item.optionValue, 'voteType')] : []
                },
                data: item.eventValue
            };
        }
    }

    if (item.id === 'delegation') {
        return {
            type: item.type,
            action: {
                function_name: item.id,
                parameters: item.optionValue ? [mapOptionToKeyValuePair(item.optionValue, 'delegation_params')] : []
            },
            data: commonData
        };
    }

    if (item.id == 'voteOnProposal' && item.type == 'CRON' && item.optionValue) {
        alert(item.optionValue.id);
        item.parameters =
            item.parameters?.map((param) => {
                if (param.type === 'options') {
                    return {
                        name: param.name,
                        id: param.id || 'vote',
                        type: 'string',
                        value: item.optionValue?.id || 'yes'
                    };
                }
                return param;
            }) || item.parameters;
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

// For converting Trigger Configuration Response back to Form Function Format
export const mapTriggerConfigurationToFormFunction = (
    trigger: ITriggerCreateDto | IAgentConfiguration
): IFormFunctionInstance => {
    const baseFunction = TemplateFunctions.find((f) => f.id === trigger.action.function_name);

    if (!baseFunction) {
        throw new Error(
            `Function with id ${trigger.action.function_name} not found. Maybe Function MetaData has been updated.`
        );
    }

    const populateParameters = (baseParams: IParameter[], triggerParams: ISubParameter[]): IParameter[] => {
        const obj = baseParams.map((baseParam) => {
            const matchingTriggerParam = triggerParams.find((param) => param.name == baseParam.id);

            // populate upper layer
            if (matchingTriggerParam && baseParam.type !== 'options' && baseParam.type !== 'object') {
                return {
                    ...baseParam,
                    value: matchingTriggerParam.value
                };
            }

            // for nested object type
            if (matchingTriggerParam && baseParam.type === 'object') {
                const combinedSubTriggerParams = Object.entries(matchingTriggerParam.value).map(([key, value]) => ({
                    name: key,
                    value: value
                }));

                const nested_obj = {
                    ...baseParam,
                    parameters: populateParameters(baseParam.parameters || [], combinedSubTriggerParams)
                };

                return nested_obj;
            }

            return baseParam;
        });

        return obj;
    };

    const getOptionWithObjectName = (value: any, parentName: string) => {
        if (value && typeof value === 'object' && parentName === 'delegation_params') {
            return 'Drep/ Pool';
        }
        return parentName;
    };

    const populateOptionValue = (triggerParam: ISubParameter): IParameterOption => {
        if (triggerParam.value && typeof triggerParam.value === 'string') {
            return {
                id: triggerParam.value,
                name: triggerParam.value,
                type: 'string',
                parameters: undefined
            };
        } else if (triggerParam.value && typeof triggerParam.value === 'object') {
            return {
                id: 'specific',
                name: getOptionWithObjectName(triggerParam.value, triggerParam.name),
                type: 'object',
                parameters: Object.entries(triggerParam.value).map(([key, value]) => ({
                    id: key,
                    name: key,
                    type: 'string',
                    value
                }))
            };
        }
        return {
            id: triggerParam.name,
            name: triggerParam.name,
            type: 'string',
            parameters: undefined
        };
    };

    const cronValue: ICronTrigger | undefined = (trigger.data as ICronTrigger)?.probability
        ? {
              probability: (trigger.data as ICronTrigger).probability * 100,
              frequency: (trigger.data as ICronTrigger).frequency
          }
        : undefined;

    const eventParameters =
        trigger.type === 'EVENT' ? mapKeyValuePairToParamValue(trigger.action.parameters || []) : undefined;

    const final_obj = {
        id: trigger.action.function_name,
        index: '',
        name: baseFunction.name,
        description: baseFunction.description,
        parameters: populateParameters(baseFunction.parameters || [], trigger.action.parameters || []),
        type: trigger.type as TriggerType,
        cronValue,
        eventValue: trigger.type === 'EVENT' ? (trigger.data as IEventTrigger) : undefined,
        optionValue:
            baseFunction?.parameters && baseFunction?.parameters[0].type === 'options'
                ? populateOptionValue(trigger.action.parameters[0])
                : (trigger.type === 'EVENT' ? eventParameters && populateOptionValue(eventParameters[0]) : undefined) ||
                  undefined,
        selectedCronOption: undefined,
        congifuredCronSettings: undefined,
        agent_id: (trigger as IAgentConfiguration).agent_id || undefined,
        eventDescription: baseFunction.eventDescription,
        eventParameters: baseFunction.eventParameters
    };

    return final_obj;
};

export const mapAgentConfigurationToFormFunction = (agentConfiguration: IAgentConfiguration): IFormFunctionInstance => {
    const convertedObj = mapTriggerConfigurationToFormFunction({
        action: agentConfiguration.action,
        data: agentConfiguration.data,
        type: agentConfiguration.type
    });
    convertedObj.agent_id = agentConfiguration.agent_id;
    convertedObj.id = agentConfiguration.id;
    return convertedObj;
};

export const mapFormFunctionToAgentConfiguration = (formFuncion: IFormFunctionInstance): IAgentConfiguration => {
    const functionMetaData = TemplateFunctions.find((f) => f.name === formFuncion.name);

    // Ids are different. Meta data id and actual trigger id
    const convertedObj = mapFormFunctionToTriggerConfiguration({
        ...formFuncion,
        id: functionMetaData?.id || ''
    });

    return {
        ...convertedObj,
        agent_id: formFuncion.agent_id || '',
        type: formFuncion.type as TriggerType,
        id: formFuncion.id
    };
};

export const mapFormFunctionToTemplateConfiguration = (
    formFunction: IFormFunctionInstance,
    template_id: string
): ITemplateConfiguration => {
    const functionMetaData = TemplateFunctions.find((f) => f.name === formFunction.name);

    const convertedObj = mapFormFunctionToTriggerConfiguration({
        ...formFunction,
        id: functionMetaData?.id || ''
    });

    return {
        ...convertedObj,
        type: formFunction.type as TriggerType,
        id: formFunction.id,
        template_id: template_id
    };
};
