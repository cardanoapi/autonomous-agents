'use client'

import { Card } from '@app/components/atoms/Card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@app/components/molecules/Tabs';
import DefaultCron from './DefaultCron';
import { useEffect, useState } from 'react';

export interface ICronSetting {
    placeholder : string 
    default : string[]
    index : number
}

const defaultCronSetting : ICronSetting[] = [
    {
        placeholder : 'Minute',
        default : ['*' , '*' , '*', '*' , '*'],
        index : 0
    },
    {
        placeholder : 'Hour',
        default : ['0' , '*' , '*', '*' , '*'],
        index : 1
    },
    {
        placeholder : 'Day',
        default : ['1' , '0' , '*', '*' , '*'],
        index : 2

    },
    {
        placeholder : 'Year',
        default : ['0' ,'0' , '1', '1' ,'*'],
        index : 4
    }
]

export default function TriggerTab() {

    const [cron , setCron] = useState('')
    const [defaultSelected , setDefaultSelected] = useState('')

    useEffect(()=>{
        console.log(cron)
    },[cron])

    return (
        <Tabs defaultValue='Cron'>
                <TabsList className='w-full justify-start rounded-none border-b-[1px] pl-0 mb-4 gap-6'>
                    <TabsTrigger value="Cron">Cron Trigger</TabsTrigger>
                    <TabsTrigger value="Events">Event Trigger</TabsTrigger>
                </TabsList>
                <Card className="bg-transparent border-brand-gray-100 w-full border-[1px] p-0 pb-5 min-h-[160px]">
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
                            { defaultCronSetting.map((item : ICronSetting) =>
                              
                               <TabsContent value={item.placeholder}>
                                <DefaultCron cronSetting={item} onChange={setCron} defaultSelected={defaultSelected} setDefaultSelected={setDefaultSelected}/>
                               </TabsContent>    
                        )
                            }
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
