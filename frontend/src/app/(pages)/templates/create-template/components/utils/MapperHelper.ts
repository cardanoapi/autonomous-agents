import { ISubParameter } from '@api/agents';
import { IParameter, IParameterOption } from '@models/types/functions';

export const mapParamValueToKeyValuePair = (params: IParameter[]): ISubParameter[] => {
    return params.map((param) => ({
        name: param.id || param.name,
        value: param.parameters
            ? convertToKeyValuePairObject(param.parameters)
            : param.value
    }));
};

export const convertToKeyValuePairObject = (
    params: IParameter[]
): Record<string, any> => {
    return params.reduce(
        (obj, param) => {
            obj[param.id] = param.value;
            return obj;
        },
        {} as Record<string, any>
    );
};
export const mapOptionToKeyValuePair = (
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

export const mapKeyValuePairToParamValue = (
    subParams: ISubParameter[]
): IParameter[] => {
    return subParams.map((subParam) => ({
        id: subParam.name,
        type: 'string',
        name: subParam.name,
        value:
            typeof subParam.value === 'object'
                ? mapKeyValuePairToParamValue(
                      Object.entries(subParam.value).map(([key, val]) => ({
                          name: key,
                          value: val
                      }))
                  )
                : subParam.value
    }));
};
