'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown, ChevronUp, X } from 'lucide-react';

import { IParameter } from '@app/app/api/functions';
import { Button } from '@app/components/atoms/Button';
import { Card, CardTitle } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { IOption } from '@app/components/molecules/MultiSearchSelect';

import TriggerTab from './TriggerTab';

//
// interface ICronParameter {
//     name: string;
//     description?: string;
//     value: string;
// }

interface ICronTriggerForm {
    defaultCron?: string[];
    formValues?: IOption;
    parameters?: IParameter[];
    previousSelectedOption: string;
    previousConfiguredSettings: any;
    setClose: any;
    onSave?: any;
}

export default function TriggerForm({
    defaultCron,
    formValues,
    setClose,
    parameters,
    previousSelectedOption,
    previousConfiguredSettings,
    onSave
}: ICronTriggerForm) {
    const label = formValues?.label
        ? formValues.label[0].toUpperCase() + formValues.label.slice(1)
        : 'Default';

    const [cronParameters, setCronParameters] = useState<IParameter[] | []>([]);
    const [cronExpression, setCronExpression] = useState(defaultCron || '');
    const [defaultSelected, setDefaultSelected] = useState<string>(
        previousSelectedOption || 'Minute-option-one'
    );
    const [configuredSettings, setConfiguredSettings] = useState<any>(
        previousConfiguredSettings || ''
    );
    const [probability, setProbability] = useState<string>('100');
    const [errorMsg, setErrorMsg] = useState('');
    const [triggerType, setTriggerType] = useState('CRON');

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    function updateCronParameters(
        name: string,
        value: string,
        data_type: string,
        description: string,
        optional: boolean
    ) {
        const newParam: IParameter = {
            name: name,
            value: value,
            data_type: data_type,
            description: description,
            optional: optional
        };
        if (cronParameters.length <= 0) {
            setCronParameters([newParam]);
            return;
        }
        const newParameters: IParameter[] = cronParameters.filter(
            (item) => item.name !== name
        );
        newParameters.push(newParam);
        setCronParameters(newParameters);
    }

    function updateCronExpression(
        cronExpression: string,
        selectedOption: string,
        currentSettings: any
    ) {
        setDefaultSelected(selectedOption);
        setCronExpression(cronExpression);
        setConfiguredSettings(currentSettings);
    }

    const handleProbabilityChange = (value: string) => {
        setErrorMsg('');
        if (!value) {
            setProbability('');
        } else {
            if (+value < 0 || +value > 100) {
                setErrorMsg('Value cannot be less than 0 or greater than 100');
                return;
            } else setProbability(value);
        }
    };

    useEffect(() => {
        if (errorMsg) {
            const clearErrorMsg = setTimeout(() => {
                setErrorMsg('');
            }, 3000);
            return () => clearTimeout(clearErrorMsg);
        }
    }, [errorMsg]);

    return (
        <Card className="flex h-full min-h-[449px] min-w-[696px] flex-col gap-y-4 bg-brand-Azure-400 p-4 px-8">
            <form
                className="flex w-full flex-col gap-y-4 2xl:gap-y-6"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-row-reverse ">
                    <CardTitle className="!h1 !mx-auto text-center">
                        {label} Function
                    </CardTitle>
                    <X onClick={setClose} className="fixed cursor-pointer self-end" />
                </div>
                <div className="mt-4 grid w-full grid-cols-2 gap-x-6 gap-y-4">
                    {parameters?.map((parameter, index) => {
                        console.log(parameter);
                        return (
                            <div key={index} className="flex flex-col gap-y-2">
                                <label className="h3">{parameter.description}</label>
                                <Input
                                    onChange={(e) =>
                                        updateCronParameters(
                                            parameter.name,
                                            e.target.value,
                                            parameter.data_type,
                                            parameter.description,
                                            parameter.optional
                                        )
                                    }
                                    defaultValue={parameter.value}
                                />
                            </div>
                        );
                    })}
                </div>
                <TriggerTab
                    setTriggerType={setTriggerType}
                    onChange={updateCronExpression}
                    defaultCron={cronExpression}
                    previousSelectedOption={defaultSelected}
                    previousConfiguredSettings={previousConfiguredSettings}
                />
                <div className={'flex flex-col gap-4'}>
                    <span>Probability</span>
                    <div className={'flex flex-col gap-2'}>
                        <div className={'relative flex w-fit flex-row items-center'}>
                            <input
                                value={probability}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleProbabilityChange(e.target.value)
                                }
                                className={'w-[140px] p-2 text-center'}
                                type={'text'}
                            />
                            <div className={'absolute right-4 flex flex-col'}>
                                <ChevronUp
                                    className={'h-4 w-4 cursor-pointer'}
                                    onClick={() =>
                                        handleProbabilityChange(
                                            (+probability + 1).toString()
                                        )
                                    }
                                />
                                <ChevronDown
                                    className={
                                        'h-4 w-4 cursor-pointer active:scale-105'
                                    }
                                    onClick={() =>
                                        handleProbabilityChange(
                                            (+probability - 1).toString()
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {errorMsg ? (
                            <span className={' text-xs text-red-500'}>{errorMsg}</span>
                        ) : (
                            <span className={'h-4'}></span>
                        )}
                    </div>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        className="mt-6 min-w-36"
                        size="md"
                        type="submit"
                        onClick={() => {
                            onSave?.({
                                inputType: triggerType,
                                inputLabel: formValues?.label,
                                inputCronParameters: cronParameters,
                                inputCronExpression: cronExpression,
                                inputDefaultSelected: defaultSelected,
                                inputDefaultSettings: configuredSettings || '',
                                inputProbability: probability ? +probability : 0
                            });
                        }}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Card>
    );
}
