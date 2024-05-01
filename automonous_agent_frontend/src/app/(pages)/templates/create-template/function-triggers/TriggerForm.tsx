'use client';

import { TabsContent } from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { Control } from 'react-hook-form';

import { Button } from '@app/components/atoms/Button';
import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import { FormControl, FormField, FormItem } from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';

import CronTrigger from './Trigger';

interface ICronTriggerForm {
    functionName: string;
    setClose: any;
    formControl: any;
}

export default function TriggerForm({
    functionName,
    setClose,
    formControl
}: ICronTriggerForm) {
    return (
        <Card className="flex w-[50vw] flex-col gap-y-4  bg-brand-Azure-200 p-4 px-8">
            <div className="flex justify-center">
                <CardTitle className="h1 mx-auto">SendAda Function</CardTitle>
                <X onClick={setClose} className="cursor-pointer" />
            </div>

            <div className="grid-col col-2 flex gap-4">
                <div className="flex flex-col gap-y-2">
                    <Label size="medium">Address(Optional)</Label>
                    <FormField
                        control={formControl}
                        name="triggers.address"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <Input {...field} className="w-[22vw]"></Input>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-y-2">
                    <Label size="medium">Amount(Optional)</Label>
                    <FormField
                        control={formControl}
                        name="triggers.amount"
                        render={({ field }) => (
                            <FormItem>  
                                <FormControl>
                                <Input className="w-[22vw]" {...field}></Input>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <CronTrigger />
            <div className="flex justify-center">
                <Button variant="primary" className="mt-6 w-[25%]" size="md">
                    Save
                </Button>
            </div>
        </Card>
    );
}
