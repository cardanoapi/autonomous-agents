import { fetchMetadataHash } from '@api/metaData';
import { IFunctionsItem, IParameter } from '@models/types/functions';

export function checkIfToFillAnyOneField(parameter: IParameter) {
    return parameter.parameters
        ? !parameter?.optional &&
              parameter.parameters?.every((param) => param?.optional)
        : false;
}

export function checkIfAllFieldsAreEmptyOrFilled(params?: IParameter[]) {
    const isSomeFieldFilled = params?.some(
        (param) => param.value != '' && param.value != undefined
    );
    if (isSomeFieldFilled && params) {
        return params.every((param) => param.value != '' && param.value != undefined);
    }
    return true;
}

export function checkIfAllRequiredFieldAreFilled(params?: IParameter[]) {
    if (params) {
        return params
            .filter((param) => !param.optional)
            .every((param) => param.value != '' && param.value != undefined);
    }
    return false;
}

export function validateForListType(param: IParameter) {
    if (!param.items) return false;
    if (param.optional) {
        return param.items.every((item) => {
            const isAllFieldsEmptyOrFilled = checkIfAllFieldsAreEmptyOrFilled(
                item.parameters
            );
            if (!isAllFieldsEmptyOrFilled) {
                return checkIfAllRequiredFieldAreFilled(item.parameters);
            }
            return isAllFieldsEmptyOrFilled;
        });
    } else {
        return param.items.every((item) => {
            return checkIfAllRequiredFieldAreFilled(item.parameters);
        });
    }
}

async function validateAnchorUrl(param: IParameter) {
    const anchorUrl = param.parameters![0].value;
    const anchorHash = param.parameters![1].value;
    if (anchorUrl && !anchorHash) {
        try {
            param.parameters![1].value = await fetchMetadataHash(anchorUrl);
            return true;
        } catch (err: any) {
            param.parameters![0].errorMsg = err.message;
            return false;
        }
    } else return true;
}

export async function validateForObjectType(param: IParameter) {
    if (param.id === 'anchor' || param.id === 'newConstitution') {
        const valid = await validateAnchorUrl(param);
        if (!valid) return false;
    }
    if (param.optional) {
        return checkIfAllFieldsAreEmptyOrFilled(param.parameters);
    } else {
        const allRequiredFieldFilled = checkIfAllRequiredFieldAreFilled(
            param.parameters
        );
        if (!allRequiredFieldFilled) return false;
        else {
            return param.parameters?.some(
                (param) => param.value != '' && param.value != undefined
            );
        }
    }
}

export async function validateForOptionType(param: IParameter) {
    switch (param.type) {
        case 'list':
            return validateForListType(param);
        case 'object':
            return await validateForObjectType(param);
        case 'string':
        case 'hash':
        case 'url':
        case 'number':
            return validateForInputType(param);
        default:
            return true;
    }
}

export function validateForInputType(parameter: IParameter) {
    return !(
        !parameter.optional &&
        (parameter.value === '' || parameter.value === undefined)
    );
}

export async function validateForDifferentType(param: IParameter) {
    switch (param.type) {
        case 'list':
            return validateForListType(param);
        case 'object':
            return await validateForObjectType(param);
        case 'options':
            return await validateForOptionType(param.parameters![0]);
        case 'string':
        case 'hash':
        case 'url':
        case 'number':
            return validateForInputType(param);
        default:
            break;
    }
}

export function extractAnswerFromList(param: IParameter) {
    const filteredItems = param.items
        ? param.items.filter((item) => {
              return item.parameters
                  ? item.parameters.every(
                        (param) => param.value != '' && param.value != undefined
                    )
                  : false;
          })
        : [];
    if (filteredItems) {
        return filteredItems
            .map((item) => {
                if (item.type === 'object') {
                    const answerMap = new Map();
                    item.parameters?.forEach((param) => {
                        answerMap.set(param.id, param.value);
                    });
                    return Object.fromEntries(answerMap);
                } else {
                    return item.parameters?.map((param) => param.value)[0];
                }
            })
            .flat();
    }
    return filteredItems;
}

export function extractAnswerFromObject(param: IParameter) {
    const paramsMap = new Map();
    param.parameters?.forEach((param) => paramsMap.set(param.id, param.value));
    return Object.fromEntries(paramsMap);
}

export function extractAnswerFromInput(param: IParameter) {
    return { name: param.id, value: param.value };
}

export function extractAnswerFromFunction(param: IParameter) {
    return param.id;
}

export function extractAnswerFromOptions(param: IParameter) {
    switch (param.type) {
        case 'list':
            return extractAnswerFromList(param);
        case 'object':
            return extractAnswerFromObject(param);
        case 'string':
        case 'hash':
        case 'url':
        case 'number':
            return extractAnswerFromInput(param);
        case 'function':
            return extractAnswerFromFunction(param);
        default:
            break;
    }
}

export function extractAnswerFromDifferentType(param: IParameter) {
    switch (param.type) {
        case 'list':
            return {
                name: param.id,
                value: extractAnswerFromList(param)
            };
        case 'object':
            return {
                name: param.id,
                value: extractAnswerFromObject(param)
            };
        case 'options':
            return {
                name: param.id,
                value: extractAnswerFromOptions(param.parameters![0])
            };
        case 'string':
        case 'hash':
        case 'url':
        case 'number':
            return extractAnswerFromInput(param);
        default:
            break;
    }
}

export function extractAnswerFromForm(selectedFunction: IFunctionsItem | null) {
    if (!selectedFunction) {
        return [];
    }
    const answers: any = [];
    selectedFunction?.parameters?.forEach((param) => {
        answers.push(extractAnswerFromDifferentType(param));
    });
    return answers;
}
