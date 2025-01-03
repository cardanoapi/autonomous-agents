'use client';

import React, { useEffect, useState } from 'react';

import { Card } from '@app/components/atoms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';

import CustomCron from './cron/CustomCron';
import DefaultCron from './cron/DefaultCron';

export interface ICronSetting {
    placeholder: string;
    default: string[];
    index: number;
}

export interface IInputSetting {
    name: string;
    value: string | number;
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

export default function TriggerTab({
    onChange,
    defaultCron,
    previousSelectedOption,
    previousConfiguredSettings,
    setTriggerType,
    setSelectedTab,
    onlyCronTriggerTab,
    defaultToCustomTab = false
}: {
    onChange?: (cronExpression: string[], configuredSettings: string, selectedTab: any) => void;
    defaultCron?: any;
    previousSelectedOption?: string;
    previousConfiguredSettings?: IInputSetting[];
    setTriggerType?: any;
    setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
    onlyCronTriggerTab?: boolean;
    defaultToCustomTab?: boolean;
}) {
    const [cron, setCron] = useState<string[]>(
        typeof defaultCron === 'string' ? defaultCron.split(' ') : defaultCron || ['*', '*', '*', '*', '*']
    );

    /* State for persisiting custom cron settings when switching tabs*/
    const [, setCustomCron] = useState<string[]>(['*', '*', '*', '*', '*']);

    /* state for persisiting user cron settings when switching tabs*/

    const [defaultSelected, setDefaultSelected] = useState(previousSelectedOption || 'Minute-option-one');

    const defaultSelectedCronTab =
        (defaultToCustomTab && 'Custom') || previousSelectedOption?.split('-')[0] || 'Minute';

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
        { name: 'Year-option-three-end', value: 1 }
    ];

    const [configuredSettings, setConfiguredSettings] = useState<IInputSetting[]>(
        previousConfiguredSettings || initialSettings
    );

    function saveCronConfiguration(setting: IInputSetting) {
        const newSettings: IInputSetting[] = configuredSettings.map((item) => {
            if (item.name === setting.name) {
                return {
                    name: setting.name,
                    value: setting.value
                };
            } else {
                return item;
            }
        });
        setConfiguredSettings(newSettings);
    }

    function onChangeCustomCron(customSelectedCron: string[]) {
        setDefaultSelected('');
        setCustomCron(customSelectedCron);
        setCron(customSelectedCron);
    }

    useEffect(() => {
        const cronExpression = cron.map((item) => item);
        onChange?.(cronExpression, defaultSelected, configuredSettings);
    }, [cron]);

    return (
        <Tabs defaultValue="Cron">
            {onlyCronTriggerTab ? (
                <></>
            ) : (
                <TabsList className="mb-4 w-full justify-start gap-6 rounded-none border-b-[1px] pl-0">
                    <TabsTrigger value="Cron" onClick={() => setSelectedTab?.('CRON')}>
                        Cron Trigger
                    </TabsTrigger>
                    <TabsTrigger value="Event" onClick={() => setSelectedTab?.('EVENT')}>
                        Event Trigger
                    </TabsTrigger>
                </TabsList>
            )}
            <Card className="border-brand-gray-100 min-h-[160px] w-full border-[1px] bg-white p-0 pb-5">
                <TabsContent value="Cron">
                    <Tabs defaultValue={defaultSelectedCronTab}>
                        <TabsList className=" w-full justify-start  rounded-none border-b-[1px] bg-brand-Azure-400 pl-4">
                            <TabsTrigger value="Minute">Minute</TabsTrigger>
                            <TabsTrigger value="Hour">Hour</TabsTrigger>
                            <TabsTrigger value="Day">Day</TabsTrigger>
                            <TabsTrigger value="Year">Year</TabsTrigger>
                            <TabsTrigger value="Custom">Custom</TabsTrigger>
                        </TabsList>
                        <div className="mt-2 flex flex-col bg-white pl-3 pt-2">
                            {defaultCronSetting.map((item: ICronSetting, index) => (
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
                                <CustomCron customCron={cron} onChange={onChangeCustomCron} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </TabsContent>
                <TabsContent value="Event" className={'p-4'}>
                    <div className={'flex flex-row gap-4'}>
                        <span>Vote on all proposal</span>
                        <input
                            type="checkbox"
                            name={'VoteEvent'}
                            value={'EVENT'}
                            onChange={(e) => setTriggerType(e.target.value)}
                            className={'h-5 w-5'}
                        />
                    </div>
                </TabsContent>
            </Card>
        </Tabs>
    );
}
