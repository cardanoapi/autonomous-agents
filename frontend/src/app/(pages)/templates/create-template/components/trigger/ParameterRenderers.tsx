import { useEffect, useState } from 'react';

import { IParameter, IParameterOption } from '@models/types/functions';
import { SelectIcon, SelectTrigger } from '@radix-ui/react-select';

import { Input } from '@app/components/atoms/Input';
import { Select, SelectContent, SelectItem } from '@app/components/atoms/Select';
import { Label } from '@app/components/atoms/label';
import { NumberInput } from '@app/components/molecules/NumberInput';

export const RenderStringParameter = (
    param: IParameter,
    onValueChange: (id: string, value: any) => void
) => (
    <div className="flex w-full flex-col gap-2">
        <Label className="h4">
            {param.name}
            {param.optional == false ? ' *' : ''}
        </Label>
        <Input
            defaultValue={param.value}
            className="w-full"
            onChange={(e) => onValueChange(param.id, e.target.value)}
        />
    </div>
);

export const RenderNumberParameter = (
    param: IParameter,
    onValueChange: (id: string, value: any) => void
) => (
    <div className="flex w-full flex-col gap-2">
        <Label className="h4">
            {param.name}
            {param.optional == false ? ' *' : ''}
        </Label>
        <NumberInput
            defaultValue={param.value ? Number(param.value) : 0}
            className="w-full"
            onChange={(e) => onValueChange(param.id, e.target.value)}
        />
    </div>
);

export const RenderObjectParameter = (
    param: IParameter,
    onNestedValueChange: (parentId: string, subParamId: string, newValue: any) => void
) => (
    <div className="flex w-full flex-col gap-2">
        <Label className="h4">
            {param.name}
            {param.optional == false ? ' *' : ''}
        </Label>
        <div className="ml-4 grid grid-cols-2 gap-4">
            {param.parameters?.map((subParam, subIndex) => (
                <div key={subIndex} className="flex items-center gap-4">
                    <Label className="h4 flex">{`Url${subParam.optional == false ? ' *' : ''}`}</Label>
                    <Input
                        defaultValue={subParam.value}
                        className="w-full"
                        onChange={(e) =>
                            onNestedValueChange(param.id, subParam.id, e.target.value)
                        }
                    />
                </div>
            ))}
        </div>
    </div>
);

export const RenderOptionsParameter = (
    param: IParameter,
    onOptionChange?: (value: any) => void,
    defaultOptionValue?: IParameterOption | null
) => {
    const handleSelectedOptionParamChange = (paramId: string, newValue: any) => {
        if (!defaultOptionValue) return;

        // Create a new array of parameters with the updated parameter
        const updatedParameters = defaultOptionValue?.parameters?.map((param) =>
            param.id === paramId ? { ...param, value: newValue } : param
        );

        // Create a new option object with the updated parameters
        const updatedOption = {
            ...defaultOptionValue,
            parameters: updatedParameters
        };

        // Trigger the onChange handler with the new option
        updatedOption && onOptionChange && onOptionChange(updatedOption);
    };

    const handleOptionChange = (optionValue: any) => {
        const currentOption = param.options?.find(
            (option) => option.name === optionValue
        );
        onOptionChange?.(currentOption);
    };

    return (
        <div className="flex w-full flex-col gap-2">
            <Label className="h4">
                {param.name}
                {param.optional == false ? ' *' : ''}
            </Label>
            <Select onValueChange={(name) => handleOptionChange(name)}>
                <SelectTrigger className="flex w-full items-center justify-between rounded-lg border-2 border-brand-border-300 bg-white px-2 py-2">
                    {defaultOptionValue?.name || 'Select an option'}
                    <SelectIcon />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {param.options?.map((option, optIndex) => (
                        <SelectItem key={optIndex} value={option.name}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {defaultOptionValue?.parameters &&
                renderParameters(
                    defaultOptionValue.parameters,
                    handleSelectedOptionParamChange
                )}
        </div>
    );
};

export const renderParameters = (
    parameters: IParameter[],
    onValueChange: (id: string, value: any) => void,
    onNestedValueChange?: (parentId: string, subParamID: string, value: any) => void,
    handleOptionChange?: (value: any) => void,

    // Option is the only function type whose value is stored on the outer object since it contains multiple nesting with multiple params
    // todo: refactor
    optionValue?: IParameterOption
) => (
    <div className="flex flex-col gap-4">
        {parameters.map((param, index) => (
            <div key={index}>
                {param.type === 'string' ||
                param.type === 'hash' ||
                param.type === 'url'
                    ? RenderStringParameter(param, onValueChange)
                    : param.type === 'number'
                      ? RenderNumberParameter(param, onValueChange)
                      : (param.type === 'object' || param.type === 'list') &&
                          param.parameters
                        ? RenderObjectParameter(param, onNestedValueChange!)
                        : param.type === 'options' && param.options
                          ? RenderOptionsParameter(
                                param,
                                handleOptionChange,
                                optionValue || null
                            )
                          : null}
            </div>
        ))}
    </div>
);
