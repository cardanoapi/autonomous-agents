'use client';

import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger
} from '@app/components/atoms/Dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import MultipleSelector, {
    IMultipleSelectorRef,
    IOption
} from '@app/components/molecules/MultiSearchSelect';
import SelectedCard from '@app/components/molecules/SelectedCard';
import TriggerForm, { triggerFormSchema } from './components/TriggerForm';
import { useQuery } from '@tanstack/react-query';
import { fetchFunctions , IFunction } from '@app/app/api/functions';

const templateFormSchema = z.object({
    templateName: z.string(),
    templateDescription: z.string().optional(),
    agentRole: z.any()
});

export const DemoAgentFunctionOptions: IOption[] = [
    { label: 'Send Ada', value: 'SendAda' },
    { label: 'Create Proposal', value: 'CreatePropsal' },
    { label: 'Vote Propsal', value: 'VotePropsal' },
    { label: 'Burn Token', value: 'BurnToken' }
];

export default function TemplateForm() {
    const functionRef = useRef<any>(null);
    
    const {data : functions} = useQuery({queryKey:['functions'] , queryFn:fetchFunctions})

    const [functionOptions , setFunctionOptions] = useState<IOption[]|[]>([])

     
    useEffect(() => {
        if (functions) {
          setFunctionOptions(functions.map((item: IFunction) : IOption => ({
            label: item.name,
            value: item.name
          })));
        }
      }, [functions]);

    const form = useForm<z.infer<typeof templateFormSchema>>({
        resolver: zodResolver(templateFormSchema)
    });

    function onSubmit(formData: z.infer<typeof templateFormSchema>) {
        console.log(functionRef.current?.selectedValue);
        console.log(formData);
    }

    const [selected, setSelected] = useState<IOption[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentDialogForm, setCurrentDialogForm] = useState<string | null>(null);

    function openSelectedOption(option: IOption) {
        console.log(option);
        setCurrentDialogForm(option.value);
        setDialogOpen(true);
    }

    function unselectOption(option: IOption) {
        const filteredSelected = selected.filter((s) => s.value !== option.value);
        setSelected(filteredSelected);
    }

    return (
        <>
            <Dialog open={dialogOpen}>
                <DialogContent>
                    <TriggerForm
                        formValues={selected.find(
                            (elem) => elem.value === currentDialogForm
                        )}
                        setClose={() => {
                            setDialogOpen(false);
                        }}
                        onSubmit={(formData: z.infer<typeof triggerFormSchema>) => {
                            console.log(formData);
                            const selectedOption = selected.find(
                                (elem) => elem.value === currentDialogForm
                            );
                            if (selectedOption) {
                                const updatedSelectedOption: IOption = {
                                    ...selectedOption,
                                    extraValues: {
                                        ...selectedOption?.extraValues,
                                        address: formData.address,
                                        amount: formData.amount
                                    }
                                };
                                setSelected([
                                    ...selected.filter(
                                        (elem) => elem.value !== currentDialogForm
                                    ),
                                    updatedSelectedOption
                                ]);
                            }
                            setDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Card className="w-[790px] min-h-[493px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="templateName"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Template Name</Label>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Template Name"
                                            className="mt-3 w-[297px]"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="templateDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="mt-6 inline-block">
                                        Template Description
                                    </Label>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Text..."
                                            className="mt-3 h-[123px] w-[297px]"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agentRole"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="mt-6 inline-block">
                                        Agent Behaviour
                                    </Label>

                                    <FormControl>
                                        <div className="w-[207px]">
                                            <MultipleSelector
                                                options={functionOptions}
                                                placeholder="Add Agent Function"
                                                className="mt-3 w-[297px]"
                                                appearOnTop={true}
                                                {...field}
                                                ref={functionRef}
                                                onChange={(option: IOption) => {
                                                    setSelected([...selected, option]);
                                                }}
                                                openSelectedOption={openSelectedOption}
                                                onUnselect={unselectOption}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <div className="mt-2 grid w-[80%] grid-cols-2 gap-4">
                    {selected.map((option: IOption, index) => {
                        return (
                            <SelectedCard
                                templateName={option.value}
                                key={index}
                                handleEdit={() => {
                                    openSelectedOption(option);
                                }}
                                handleUnselect={() => {
                                    functionRef.current.handleUnselect(option);
                                }}
                            />
                        );
                    })}
                </div>
                <Button variant="primary" size="md" className="mt-6" type="submit">
                    Create Template
                </Button>
            </Card>
        </>
    );
}
