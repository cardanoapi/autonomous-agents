'use client';

import { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import { IParameter } from '@app/app/api/functions';
import { Button } from '@app/components/atoms/Button';
import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { IOption } from '@app/components/molecules/MultiSearchSelect';

import TriggerTab from './TriggerTab';

interface ICronParameter {
    name: string;
    description?: string;
    value: string;
}

interface ICronTriggerForm {
    defaultCron?: string[];
    formValues?: IOption;
    parameters?: IParameter[];
    previousSelectedOption: string;
    previousConfiguredSettings: any;
    setClose: any;
    onSave?: any;
}

interface ICron {
    parameters: ICronParameter[];
    cronExpression: string;
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

    const [cronParameters, setCronParameters] = useState<IParameter[]|[]>([]);
    const [cronExpression, setCronExpression] = useState(defaultCron || '');
    const [defaultSelected, setDefaultSelected] = useState<string>(
        previousSelectedOption || 'Minute-option-one'
    );
    const [configuredSettings, setConfiguredSettings] = useState<any>(
        previousConfiguredSettings || ''
    );

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    function updateCronParameters(name: string, value: string , data_type : string , description : string , optional : boolean) {
        const newParam : IParameter = { name: name, value: value , data_type : data_type , description : description , optional : optional }
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
                    onChange={updateCronExpression}
                    defaultCron={cronExpression}
                    previousSelectedOption={defaultSelected}
                    previousConfiguredSettings={previousConfiguredSettings}
                />
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        className="mt-6 min-w-36"
                        size="md"
                        type="submit"
                        onClick={() => {
                            onSave?.({
                                inputLabel: formValues?.label,
                                inputCronParameters: cronParameters,
                                inputCronExpression: cronExpression,
                                inputDefaultSelected: defaultSelected,
                                inputDefaultSettings: configuredSettings || ''
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
