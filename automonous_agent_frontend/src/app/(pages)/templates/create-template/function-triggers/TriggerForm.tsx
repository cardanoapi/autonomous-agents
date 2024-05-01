'use client';

import { TabsContent } from '@radix-ui/react-tabs';
import { X } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';

import CronTrigger from './Trigger';

interface ICronTriggerForm {
    functionName : string
    setClose : any
}

export default function TriggerForm({functionName , setClose} : ICronTriggerForm) {
    return (
        <Card className="flex w-[50vw] flex-col gap-y-3 bg-brand-Azure-200 p-4 px-8">
            <div className="mb-2 flex justify-center">
                <CardTitle className="h2 mx-auto">SendAda Function</CardTitle>
                 <X onClick={setClose} className='cursor-pointer'/>
            </div>

            <div className="grid-col col-2 flex gap-4">
                <div className="flex flex-col gap-y-2">
                    <Label size="medium">Address(Optional)</Label>
                    <Input className="w-[22vw]"></Input>
                </div>
                <div className="flex flex-col gap-y-2">
                    <Label size="medium">Amount(Optional)</Label>
                    <Input className="w-[22vw]"></Input>
                </div>
            </div>
            <CronTrigger />
            <div className="flex justify-center">
                <Button variant="primary" className="mt-4 w-[25%]" size="md">
                    Save
                </Button>
            </div>
        </Card>
    );
}
