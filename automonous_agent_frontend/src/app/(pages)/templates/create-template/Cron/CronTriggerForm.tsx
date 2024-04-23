'use client';

import { TabsContent } from '@radix-ui/react-tabs';

import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';

import CronTrigger from './CronTrigger';
import { Button } from '@app/components/atoms/Button';

export default function CronTriggerForm() {
    return (
        <Card className="flex w-[506px] flex-col gap-y-3 bg-brand-Azure-100 p-4 pb-8 pr-16">
            <CardTitle className="text-base mb-4">SendAda Function</CardTitle>

            <Label size="small">Address(Optional)</Label>
            <Input className="w-["></Input>

            <Label size="small">Amount(Optional)</Label>
            <Input className='w-'></Input>

            <Label className='inline-flex mt-8'>Cron Trigger</Label>
            <CronTrigger />

            <Button variant="primary" className='w-[25%] mt-4' size="md">Save</Button>
        </Card>
    );
}
