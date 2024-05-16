'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@app/components/atoms/Button';
import { CardTitle } from '@app/components/atoms/Card';
import { Card } from '@app/components/atoms/Card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem
} from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';
import { IOption } from '@app/components/molecules/MultiSearchSelect';

import TriggerTab from './TriggerTab';

interface ICronTriggerForm {
    formValues?: IOption;
    setClose: any;
    onSubmit: any;
}

export const triggerFormSchema = z.object({
    address: z.string(),
    amount: z.string().optional()
});

export default function TriggerForm({
    formValues,
    setClose,
    onSubmit
}: ICronTriggerForm) {
    const form = useForm<z.infer<typeof triggerFormSchema>>({
        resolver: zodResolver(triggerFormSchema),
        defaultValues: {
            address: formValues?.extraValues?.address,
            amount: formValues?.extraValues?.amount
        }
    });

    const label = formValues?.label
        ? formValues.label[0].toUpperCase() + formValues.label.slice(1)
        : 'Default';

    return (
        <Card className="flex h-full min-h-[449px] min-w-[696px] flex-col gap-y-4 bg-brand-Azure-200 p-4 px-8">
            <Form {...form}>
                <form
                    className="flex w-full flex-col gap-y-4 2xl:gap-y-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex flex-row-reverse ">
                        <CardTitle className="!h1 !mx-auto text-center">
                            {label} Function
                        </CardTitle>
                        <X onClick={setClose} className="cursor-pointer self-end fixed" />
                    </div>

                    <div className="grid-col col-2 flex gap-4">
                        <div className="flex w-full flex-col gap-y-2">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label size="medium">Address(Optional)</Label>
                                        <FormControl>
                                            <Input
                                                className="w-[100%]"
                                                {...field}
                                            ></Input>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex w-full flex-col gap-y-2">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label size="medium">Amount(Optional)</Label>
                                        <FormControl>
                                            <Input
                                                className="w-[100%]"
                                                {...field}
                                            ></Input>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <TriggerTab />
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
