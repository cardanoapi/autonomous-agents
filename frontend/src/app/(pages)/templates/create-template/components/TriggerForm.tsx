'use client';

import React, { useState } from 'react';

import { IParameter } from '@api/functions';
import { X } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { Card, CardTitle } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { IOption } from '@app/components/molecules/MultiSearchSelect';
import ProbabilityInput from '@app/components/molecules/ProbabilityInput';

import TriggerTab from './TriggerTab';

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
    const [triggerType, setTriggerType] = useState('CRON');
    const [selectedTab, setSelectedTab] = useState('CRON');

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
        const newParameters: IParameter[] = cronParameters?.filter(
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

    const renderParams = (parameters: IParameter[]) => {
        return parameters?.map((param) => {
            return (
                <div key={param.name} className="flex flex-col gap-y-4">
                    <label className="h3 inline-flex">{param.description}</label>
                    <Input
                        disabled={selectedTab === 'EVENT'}
                        onChange={(e) =>
                            updateCronParameters(
                                param.name,
                                e.target.value,
                                param.data_type,
                                param.description,
                                param.optional
                            )
                        }
                        value={param.value}
                        type={param.data_type}
                    />
                </div>
            );
        });
    };

    return (
        <Card className="flex h-full flex-col gap-y-4 bg-brand-Azure-400 !px-4 !py-3">
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
                        return (
                            <div key={index} className="flex flex-col gap-y-2">
                                <label className="h3">{parameter.description}</label>
                                {parameter.parameters ? (
                                    <div className="mx-4 flex flex-col gap-4">
                                        {renderParams(parameter.parameters)}
                                    </div>
                                ) : (
                                    <Input
                                        disabled={selectedTab === 'EVENT'}
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
                                )}
                            </div>
                        );
                    })}
                </div>
                <TriggerTab
                    setSelectedTab={setSelectedTab}
                    setTriggerType={setTriggerType}
                    onChange={updateCronExpression}
                    defaultCron={cronExpression}
                    previousSelectedOption={defaultSelected}
                    previousConfiguredSettings={previousConfiguredSettings}
                />
                {selectedTab === 'EVENT' ? (
                    <></>
                ) : (
                    <div className={'flex flex-col gap-4'}>
                        <span>Probability</span>
                        <ProbabilityInput
                            onInputChange={(probability: string) =>
                                setProbability(probability)
                            }
                        />
                    </div>
                )}
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
