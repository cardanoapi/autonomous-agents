'use client';

import { useEffect, useState } from 'react';

import { Card } from '@app/components/atoms/Card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@app/components/molecules/Tabs';

import DefaultCron from './DefaultCron';
import CustomCron from './CustomCron';

export interface ICronSetting {
    placeholder: string;
    default: string[];
    index: number;
}
export interface IInputSetting {
    name : string,
    value : string | number
}

const defaultCronSetting: ICronSetting[] = [
    {
        placeholder: 'Minute',
        default: ['*', '*', '*', '*', '*'],
        index: 0
    },
    {
        placeholder: 'Hour',
        default: ['0', '*', '*', '*', '*'],
        index: 1
    },
    {
        placeholder: 'Day',
        default: ['1', '0', '*', '*', '*'],
        index: 2
    },
    {
        placeholder: 'Year',
        default: ['0', '0', '1', '1', '*'],
        index: 4
    }
];


export default function TriggerTab({onChange} : {
    onChange? : any 
}) {
    const [cron, setCron] = useState<string[]>(['*','*','*','*','*']);

    /* State for persisiting custom cron settings when switching tabs*/
    const [customCron , setCustomCron] = useState<string[]>(['*','*','*','*','*']);
    

    /* state for persisiting user cron settings when switching tabs*/

    const [defaultSelected, setDefaultSelected] = useState('Minute-option-one');

    const initialSettings: IInputSetting[] = [
        { name: 'Minute-option-two', value: 1 },
        { name: 'Minute-option-three-start', value: 0 },
        { name: 'Minute-option-three-end', value: 1 },
        { name: 'Hour-option-two', value: 1 },
        { name: 'Hour-option-three-start', value: 0 },
        { name: 'Hour-option-three-end', value: 1 },
        { name: 'Day-option-two', value: 1 },
        { name: 'Day-option-three-start', value: 0 },
        { name: 'Day-option-three-end', value: 1 },
        { name: 'Year-option-two', value: 1 },
        { name: 'Year-option-three-start', value: 0 },
        { name: 'Year-option-three-end', value: 1 },
    ];
    
    const [configuredSettings , setConfiguredSettings] = useState<IInputSetting[]>(initialSettings)

    function saveCronConfiguration(setting : IInputSetting){
        const newSettings : IInputSetting[] = configuredSettings.map((item , index) => {
            if (item.name === setting.name){
                return {
                    name : setting.name,
                    value : setting.value
                }
            }
            else {
                return item
            }

        })
        setConfiguredSettings(newSettings)
    }

    function onChangeCustomCron(customSelectedCron : string[]){
        setDefaultSelected('')
        setCustomCron(customSelectedCron)
        setCron(customSelectedCron)
    }

    useEffect(() => {
        const cronExpression = cron.map((item)=>item)
        onChange?.(cronExpression)
    }, [cron]);

    return (
        <Tabs defaultValue="Cron">
            <TabsList className="mb-4 w-full justify-start gap-6 rounded-none border-b-[1px] pl-0">
                <TabsTrigger value="Cron">Cron Trigger</TabsTrigger>
                <TabsTrigger value="Events">Event Trigger</TabsTrigger>
            </TabsList>
            <Card className="border-brand-gray-100 min-h-[160px] w-full border-[1px] bg-transparent p-0 pb-5">
                <TabsContent value="Cron">
                    <Tabs defaultValue="Minute">
                        <TabsList className="w-full justify-start gap-6 rounded-none border-b-[1px] pl-4">
                            <TabsTrigger value="Minute">Minute</TabsTrigger>
                            <TabsTrigger value="Hour">Hour</TabsTrigger>
                            <TabsTrigger value="Day">Day</TabsTrigger>
                            <TabsTrigger value="Year">Year</TabsTrigger>
                            <TabsTrigger value="Custom">Custom</TabsTrigger>
                        </TabsList>
                        <div className="mt-2 flex flex-col pl-3 pt-2">
                            {defaultCronSetting.map((item: ICronSetting , index) => (
                                <TabsContent value={item.placeholder} key={index}>
                                    <DefaultCron
                                        cronSetting={item}
                                        onChange={setCron}
                                        defaultSelected={defaultSelected}
                                        setDefaultSelected={setDefaultSelected}
                                        saveConfiguration={saveCronConfiguration}
                                        configuredSettings={configuredSettings}
                                    />
                                </TabsContent>
                            ))}
                            <TabsContent value="Custom">
                                <CustomCron customCron={customCron} onChange={onChangeCustomCron}/>
                            </TabsContent>
                        </div>
                    </Tabs>
                </TabsContent>
                <TabsContent value="Events">
                    <Tabs defaultValue="DemoEvents">
                        <TabsList>
                            <TabsTrigger value="DemoEvent">DemoEvent</TabsTrigger>
                        </TabsList>
                        <TabsContent value="DemoEvent">
                            <span>Event Tab</span>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Card>
        </Tabs>
    );
}
