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
import TriggerTab from './TriggerTab';
import { IOption } from '@app/components/molecules/MultiSearchSelect';

interface ICronTriggerForm {
    formValues? : IOption | null;
    setClose: any;
    onSubmit : any;
}

export const triggerFormSchema = z.object({
    address: z.string(),
    amount: z.string().optional()
});

export default function TriggerForm({
    formValues,
    setClose,
    onSubmit,
}: ICronTriggerForm) {

    const form = useForm<z.infer<typeof triggerFormSchema>>({
        resolver: zodResolver(triggerFormSchema),
        defaultValues : {
            address : formValues?.extraValues?.address,
            amount : formValues?.extraValues?.amount
        }
    });

    return (
        <Card className="flex flex-col gap-y-4 h-full bg-brand-Azure-200 p-4 px-8">
            <Form {...form}>
                <form
                    className="flex flex-col gap-y-4 2xl:gap-y-6 w-[50vw] 2xl:w-[35vw] 2xl:h-[36vh]"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex justify-center">
                        <CardTitle className="h1 mx-auto">{formValues?.label}</CardTitle>
                        <X onClick={setClose} className="cursor-pointer" />
                    </div>

                    <div className="grid-col col-2 flex gap-4">
                        <div className="flex flex-col gap-y-2 w-full">
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
                        <div className="flex flex-col gap-y-2 w-full">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label size="medium">Amount(Optional)</Label>
                                        <FormControl>
                                            <Input className="w-[100%]" {...field}></Input>
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
