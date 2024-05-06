'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form ,FormControl , FormDescription , FormField , FormItem } from '@app/components/atoms/Form';
import { z } from 'zod';

import { Button } from '@app/components/atoms/Button';
import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';

import CronTrigger from './Trigger';
import { IOption } from '@app/components/molecules/MultiSearchSelect';
import { Dispatch, SetStateAction } from 'react';

interface ICronTriggerForm {
    functionName: any;
    setClose: any;
    onSave?: Dispatch<SetStateAction<IOption | null>>
}

export const triggerFormSchema = z.object({
    address: z.string(),
    amount: z.string().optional()
});

export default function TriggerForm({
    functionName,
    setClose,
    onSave,
}: ICronTriggerForm) {

    const form = useForm<z.infer<typeof triggerFormSchema>>({
        resolver: zodResolver(triggerFormSchema)
    });

    function onSubmit(formData: z.infer<typeof triggerFormSchema>) {
        console.log(formData);
    }


    return (
        <Card className="flex w-[50vw] flex-col gap-y-4  bg-brand-Azure-200 p-4 px-8">
            <Form {...form}>
                <form
                    className="flex flex-col gap-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex justify-center">
                        <CardTitle className="h1 mx-auto">{functionName}</CardTitle>
                        <X onClick={setClose} className="cursor-pointer" />
                    </div>

                    <div className="grid-col col-2 flex gap-4">
                        <div className="flex flex-col gap-y-2">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label size="medium">Address(Optional)</Label>
                                        <FormControl>
                                            <Input
                                                className="w-[22vw]"
                                                {...field}
                                            ></Input>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label size="medium">Amount(Optional)</Label>
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
                        <Button
                            variant="primary"
                            className="mt-6 w-[25%]"
                            size="md"
                            type="submit"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}
