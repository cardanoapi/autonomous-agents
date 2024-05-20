'use client';

import { useState } from 'react';

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
    value: string;
}

interface ICronTriggerForm {
    formValues?: IOption;
    parameters?: IParameter[];
    setClose: any;
    onSubmit: any;
}

interface ICron {
    parameters: ICronParameter[];
    cronExpression: string;
}

export default function TriggerForm({
    formValues,
    setClose,
    parameters,
    onSubmit
}: ICronTriggerForm) {
    const label = formValues?.label
        ? formValues.label[0].toUpperCase() + formValues.label.slice(1)
        : 'Default';

    const [cronParameters, setCronParameters] = useState<ICronParameter[]|[]>([]);
    const [cronExpression, setCronExpression] = useState('');

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(cronParameters, cronExpression);
    }

    function updateCronParameters(name: string, value: string) {
        if (cronParameters.length <= 0){
            setCronParameters([{name : name , value : value}])
            return
        }
        const newParameters : ICronParameter[] = cronParameters.filter((item)=> item.name !== name)
        newParameters.push({name : name , value : value})
        setCronParameters(newParameters)
    }

    function updateCronExpression(value : string){
        setCronExpression(value)
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
                    {parameters?.map((parameter, index) => (
                        <div key={index} className="flex flex-col gap-y-2">
                            <label className="h3">{parameter.description}</label>
                            <Input onChange={(e)=>{updateCronParameters(parameter.name ,e.target.value )}}/>
                        </div>
                    ))}
                </div>
                <TriggerTab />
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        className="mt-6 min-w-36"
                        size="md"
                        type="submit"
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Card>
    );
}
