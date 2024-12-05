import { useState } from 'react';
import React from 'react';

import { TriggerType } from '@api/agents';
import { TemplateFunctions } from '@models/types/functions';
import { Slider } from '@mui/material';
import { X } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { Card, CardDescription, CardTitle } from '@app/components/atoms/Card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from '@app/components/atoms/Select';
import { cn } from '@app/components/lib/utils';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import { ErrorToast } from '@app/components/molecules/CustomToasts';

import { IFormFunctionInstance } from '../page';
import { renderParameters } from './trigger/ParameterRenderers';
import TriggerTab from './trigger/TriggerTab';

interface IFunctionFormParams {
    currentFunction?: IFormFunctionInstance;
    onValueChange: (data: IFormFunctionInstance) => void;
    onClose: (data: IFormFunctionInstance) => void;
    onSave: (item: IFormFunctionInstance) => void;
    btnPlaceholder?: string;
    renderFunctionSelector?: boolean;
    editMode?: boolean;
}

export const FunctionForm = ({
    currentFunction,
    onValueChange,
    onClose,
    onSave,
    btnPlaceholder,
    renderFunctionSelector = false,
    editMode = false
}: IFunctionFormParams) => {
    const [functionState, setFunctionState] = useState<IFormFunctionInstance>(
        currentFunction || {
            ...TemplateFunctions[0],
            index: '0',
            type: 'CRON' as TriggerType
        }
    );
    const [cronExpression] = useState(
        currentFunction?.cronValue?.frequency || '* * * * *'
    );

    const updateFunctionState = (updates: Partial<IFormFunctionInstance>) => {
        if (!functionState) return;
        const updatedFunction = { ...functionState, ...updates };
        setFunctionState(updatedFunction);
        onValueChange?.(updatedFunction);
    };

    const handleCronChange = (
        cronValueListFormat: string[],
        defaultSelected: string,
        configuredSettings: any
    ) => {
        const cronValue = {
            frequency: cronValueListFormat.join(' '),
            probability: functionState?.cronValue?.probability || 100
        };
        updateFunctionState({
            cronValue,
            selectedCronOption: defaultSelected,
            congifuredCronSettings: configuredSettings
        });
    };

    const handleProbabilityChange = (value: number) => {
        updateFunctionState({
            cronValue: {
                ...functionState?.cronValue,
                frequency: cronExpression,
                probability: value
            }
        });
    };

    const handleParameterChange = (paramId: string, newValue: any) => {
        const updatedParameters = functionState?.parameters?.map((param) =>
            param.id === paramId ? { ...param, value: newValue } : param
        );
        console.log(updatedParameters);
        updateFunctionState({ parameters: updatedParameters });
    };

    const handleTypeChange = (type: string) => {
        const newFunciontState = { ...functionState, type: type as TriggerType };
        updateFunctionState(newFunciontState);
    };

    const handleNestedParameterChange = (
        parentId: string,
        subParamId: string,
        newValue: any
    ) => {
        const updatedParameters = functionState?.parameters?.map((param) =>
            param.id === parentId
                ? {
                      ...param,
                      parameters: param.parameters?.map((subParam) =>
                          subParam.id === subParamId
                              ? { ...subParam, value: newValue }
                              : subParam
                      )
                  }
                : param
        );
        updateFunctionState({ parameters: updatedParameters });
    };

    const handleOptionChange = (optionValue: any) => {
        const updatedFuctionState = { ...functionState, optionValue: optionValue };
        updateFunctionState(updatedFuctionState);
    };

    const handleOnSave = () => {
        const validState = checkAllRequiredFieldsAreFilled();
        console.log(functionState);
        validState && onSave?.(functionState);
    };

    const checkAllRequiredFieldsAreFilled = () => {
        if (functionState?.type === 'EVENT') {
            //event type has no parameter for now
            return true;
        }

        if (
            functionState?.parameters?.[0].type === 'options' &&
            !functionState.optionValue
        ) {
            ErrorToast('Please select an option');
            return false;
        }

        let validState = true;
        functionState?.parameters?.forEach((item) => {
            if ((item.optional === false && !item.value) || item.value === '') {
                validState = false;
            }
            item.parameters?.forEach((subItem) => {
                if (
                    (subItem.optional === false && !subItem.value) ||
                    subItem.value === ''
                ) {
                    validState = false;
                }
            });
        });
        !validState && ErrorToast('Please fill all required fields');
        return validState;
    };

    const handleFunctionsSelect = (functionID: string) => {
        const selectedFunction = TemplateFunctions.find(
            (func) => func.id === functionID
        );
        if (selectedFunction) {
            const currentSelectedFunction = {
                ...selectedFunction,
                index: '0',
                type: 'CRON' as TriggerType,
                cronValue: { frequency: '* * * * *', probability: 100 }
            };
            setFunctionState(currentSelectedFunction);
        }
    };

    return (
        <Card
            className={cn(
                ' flex h-full w-full flex-col justify-between bg-brand-Azure-400 !px-4 max-md:rounded-t-2xl md:min-h-[450px] md:min-w-[500px]',
                renderFunctionSelector ? 'py-8' : 'py-4'
            )}
        >
            <X
                className="absolute right-6 top-4 cursor-pointer"
                onClick={() => onClose?.(functionState)}
            />
            <div className="flex flex-col gap-y-4 max-md:gap-y-6">
                {renderFunctionSelector ? (
                    <CardTitle className="flex flex-col gap-2">
                        <span className="h4">Function</span>
                        <Select
                            onValueChange={(value: string) =>
                                handleFunctionsSelect(value)
                            }
                        >
                            <SelectTrigger className="flex items-center justify-between bg-white px-2 py-1 text-start">
                                {functionState?.name}
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {TemplateFunctions.map((item, index) => (
                                    <SelectItem key={index} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardTitle>
                ) : (
                    <CardTitle className="!h1 text-center">
                        {functionState?.name}
                    </CardTitle>
                )}
                <div className="flex w-full justify-end">
                    {functionState && functionState.canBeEvent && (
                        <CustomCombobox
                            defaultValue={functionState.type || 'CRON'}
                            itemsList={['CRON', 'EVENT']}
                            onSelect={(triggerType: any) =>
                                handleTypeChange(triggerType as TriggerType)
                            }
                            className={'w-24 rounded-md border-[2px] px-2'}
                        />
                    )}
                </div>
                {functionState?.parameters &&
                    renderParameters(
                        functionState.type === 'CRON'
                            ? functionState.parameters || []
                            : functionState.eventParameters || [],
                        handleParameterChange,
                        handleNestedParameterChange,
                        handleOptionChange,
                        functionState.optionValue
                    )}

                {functionState.type === 'CRON' && (
                    <>
                        <TriggerTab
                            onlyCronTriggerTab
                            defaultCron={cronExpression}
                            onChange={handleCronChange}
                            previousConfiguredSettings={
                                functionState?.congifuredCronSettings
                            }
                            previousSelectedOption={functionState?.selectedCronOption}
                            defaultToCustomTab={editMode}
                        />
                        <div className="px-4">
                            <span className="h4 text-center">
                                Trigger Probability:{' '}
                                <span className="text-brand-Blue-200">
                                    {functionState?.cronValue?.probability} %
                                </span>
                            </span>
                            <Slider
                                value={functionState?.cronValue?.probability || 100}
                                valueLabelDisplay="auto"
                                onChange={(_, newValue) =>
                                    handleProbabilityChange(
                                        typeof newValue === 'number'
                                            ? newValue
                                            : newValue[0]
                                    )
                                }
                            />
                        </div>
                    </>
                )}
                {functionState.type === 'EVENT' && (
                    <Card className="bg-gray-200">
                        <CardTitle>Event Trigger</CardTitle>
                        <CardDescription>
                            {functionState?.eventDescription}
                        </CardDescription>
                    </Card>
                )}
            </div>
            <Button
                variant="primary"
                className="mt-6 min-w-36"
                size="md"
                onClick={() => functionState && handleOnSave()}
            >
                {btnPlaceholder || 'Save'}
            </Button>
        </Card>
    );
};
