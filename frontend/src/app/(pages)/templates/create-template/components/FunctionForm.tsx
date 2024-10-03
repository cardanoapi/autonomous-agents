import { useEffect, useState } from 'react';
import React from 'react';

import { TriggerType } from '@api/agents';
import { Slider } from '@mui/material';
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@radix-ui/react-select';
import { current } from '@reduxjs/toolkit';
import { X } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { Card, CardDescription, CardTitle } from '@app/components/atoms/Card';
import { Select } from '@app/components/atoms/Select';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';

import { IConfiguredFunctionsItem } from '../page';
import { renderParameters } from './utils/ParameterRenderers';
import TriggerTab from './utils/TriggerTab';

interface IFunctionForm {
    currentFunction: IConfiguredFunctionsItem;
    onValueChange: (data: IConfiguredFunctionsItem) => void;
    onClose: () => void;
    onSave: (item: IConfiguredFunctionsItem) => void;
}

export const FunctionForm = ({
    currentFunction,
    onValueChange,
    onClose,
    onSave
}: IFunctionForm) => {
    const [functionState, setFunctionState] =
        useState<IConfiguredFunctionsItem>(currentFunction);
    const [cronExpression] = useState(
        currentFunction?.cronValue?.frequency || '* * * * *'
    );

    const [currentFunctionType, setCurrentFunctionType] = useState<TriggerType>(
        functionState?.type || 'CRON'
    );

    const updateFunctionState = (updates: Partial<IConfiguredFunctionsItem>) => {
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
        updateFunctionState({ parameters: updatedParameters });
    };

    const handleTypeChange = (type: string) => {
        setCurrentFunctionType(type as TriggerType);
        updateFunctionState({
            ...functionState,
            type: type as TriggerType
        });
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

    return (
        <Card className="relative flex h-full min-h-[450px] min-w-[500px] flex-col justify-between bg-brand-Azure-400 !px-4 !py-3">
            <X className="absolute right-4 top-4 cursor-pointer" onClick={onClose} />
            <div className="flex flex-col gap-y-4">
                <CardTitle className="!h1 text-center">
                    {currentFunction?.name}
                </CardTitle>
                <div className="flex w-full justify-end">
                    {currentFunction.canBeEvent && (
                        <CustomCombobox
                            defaultValue={currentFunction.type || 'CRON'}
                            itemsList={['CRON', 'EVENT']}
                            onSelect={(triggerType) =>
                                handleTypeChange(triggerType as TriggerType)
                            }
                            className={'w-24 rounded-md border-[2px] px-2'}
                        />
                    )}
                </div>
                {currentFunction?.parameters &&
                    renderParameters(
                        currentFunctionType === 'CRON'
                            ? currentFunction.parameters
                            : currentFunction.eventParameters || [],
                        handleParameterChange,
                        handleNestedParameterChange,
                        handleOptionChange,
                        functionState.optionValue
                    )}

                {currentFunctionType === 'CRON' && (
                    <>
                        <TriggerTab
                            onlyCronTriggerTab
                            defaultCron={cronExpression}
                            onChange={handleCronChange}
                            previousConfiguredSettings={
                                functionState?.congifuredCronSettings
                            }
                            previousSelectedOption={functionState?.selectedCronOption}
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
                {currentFunctionType === 'EVENT' && (
                    <Card className="bg-gray-200">
                        <CardTitle>Event Trigger</CardTitle>
                        <CardDescription>
                            {currentFunction?.eventDescription}
                        </CardDescription>
                    </Card>
                )}
            </div>
            <Button
                variant="primary"
                className="mt-6 min-w-36"
                size="md"
                onClick={() => functionState && onSave?.(functionState)}
            >
                Save
            </Button>
        </Card>
    );
};
