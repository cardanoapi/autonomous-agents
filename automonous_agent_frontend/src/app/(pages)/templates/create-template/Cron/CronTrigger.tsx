import { Tab } from '@mui/material';

import { Card } from '@app/components/atoms/Card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@app/components/molecules/Tabs';

import DefaultCron from './DefaultCron';
import CustomCron from './CustomCron';

export default function CronTrigger() {
    return (
        <Tabs defaultValue='Cron'>
                <TabsList className='w-full justify-start rounded-none border-b-[1px] pl-0 mb-4 gap-6'>
                    <TabsTrigger value="Cron">Cron Trigger</TabsTrigger>
                    <TabsTrigger value="Events">Event Trigger</TabsTrigger>
                </TabsList>
                <Card className="bg-transparent border-brand-gray-100 w-full border-[1px] p-0 pb-5">
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
                            <TabsContent value="Minute">
                                <DefaultCron placeholder="Minute" />
                            </TabsContent>
                            <TabsContent value="Hour">
                                <DefaultCron placeholder="Hour" />
                            </TabsContent>
                            <TabsContent value="Day">
                                <DefaultCron placeholder="Day" />
                            </TabsContent>
                            <TabsContent value="Year">
                                <DefaultCron placeholder="Year" />
                            </TabsContent>
                            <TabsContent value="Custom">
                                <CustomCron/>
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
