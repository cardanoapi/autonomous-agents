import { Card } from '@app/components/atoms/Card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@app/components/molecules/Tabs';

import DefaultCron from './DefaultCron';

export default function CronTrigger() {
    return (
        <Card className="background-white border-brand-gray-100 border-[1px] p-0 pb-5 w-full">
            <Tabs defaultValue="Minute">
                <TabsList className="w-full justify-between rounded-none border-b-[1px] pl-6 pr-16">
                    <TabsTrigger value="Minute">Minute</TabsTrigger>
                    <TabsTrigger value="Hour">Hour</TabsTrigger>
                    <TabsTrigger value="Day">Day</TabsTrigger>
                    <TabsTrigger value="Year">Year</TabsTrigger>
                    <TabsTrigger value="Custom">Custom</TabsTrigger>
                </TabsList>
                <div className="mt-2 flex flex-col pl-3">
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
                        <DefaultCron placeholder='Year'/>
                    </TabsContent>
                    <TabsContent value="Custom">
                        <span>Custom configuration</span>
                    </TabsContent>
                </div>
            </Tabs>
        </Card>
    );
}
