'use client';

import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { IFunction, fetchFunctions } from '@app/app/api/functions';
import { IParameter } from '@app/app/api/functions';
import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import { Form, FormControl, FormField, FormItem } from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import MultipleSelector from '@app/components/molecules/MultiSearchSelect';
import SelectedCard from '@app/components/molecules/SelectedCard';

import TriggerForm from './components/TriggerForm';

export interface ITemplateOption {
    value: string;
    label: string;
    disable?: boolean;
    extraValues?: any;
    fixed?: boolean;
    parameters: IParameter[];
    [key: string]: string | boolean | undefined | object;
}

const templateFormSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    triggers : z.any()
});

export default function TemplateForm() {
    const form = useForm<z.infer<typeof templateFormSchema>>({
        resolver: zodResolver(templateFormSchema)
    });

    /*Related to Function Options*/
    const functionRef = useRef<any>(null);
    const { data: functions } = useQuery<IFunction[]>({
        queryKey: ['functions'],
        queryFn: fetchFunctions
    });
    const [functionOptions, setFunctionOptions] = useState<ITemplateOption[] | []>([]);

    /*Related to Popup dialog */
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentDialogForm, setCurrentDialogForm] = useState<string | null>(null);

    /*Related to Selected option*/
    const [selected, setSelected] = useState<ITemplateOption[]>([]);
    function onSubmit(formData: z.infer<typeof templateFormSchema>) {
        console.log(formData);
        console.log(selected)
    }
    function openSelectedOption(option: ITemplateOption) {
        console.log(option);
        setCurrentDialogForm(option.value);
        setDialogOpen(true);
    }
    function unselectOption(option: ITemplateOption) {
        const filteredSelected = selected.filter((s) => s.value !== option.value);
        setSelected(filteredSelected);
    }

     /* Sets fetched functions as options for the dropdown */
    useEffect(() => {
        if (functions) {
            setFunctionOptions(
                functions.map(
                    (item: IFunction): ITemplateOption => ({
                        label: item.function_name,
                        value: item.function_name,
                        parameters: item.parameters
                    })
                )
            );
        }
    }, [functions]);

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
                        parameters={
                            selected.find((elem) => elem.value === currentDialogForm)
                                ?.parameters
                        }
                        onSubmit={() => {
                            console.log('test');
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Card className="min-h-[493px] w-[790px]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Template Name</Label>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Template Name"
                                            className="h-[38px] w-[297px]"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="inline-block">
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
                        <div>
                            <Label className=" inline-block">Agent Behaviour</Label>
                            <div className="w-[297px] mt-3">
                                <MultipleSelector
                                    options={functionOptions}
                                    placeholder="Add Agent Function"
                                    appearOnTop={true}
                                    ref={functionRef}
                                    onChange={(option: ITemplateOption) => {
                                        setSelected([...selected, option]);
                                    }}
                                    openSelectedOption={openSelectedOption}
                                    onUnselect={unselectOption}
                                />
                            </div>
                        </div>
                        <div className="grid w-[80%] grid-cols-2 gap-4">
                            {selected.map((option: ITemplateOption, index) => {
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
                        <Button
                            variant="primary"
                            size="md"
                            className="mt-2 max-w-40"
                            type="submit"
                        >
                            Create 
                        </Button>
                    </form>
                </Form>
            </Card>
        </>
    );
}
