'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { IFunction, fetchFunctions } from '@app/app/api/functions';
import { IParameter } from '@app/app/api/functions';
import { postTemplateData } from '@app/app/api/templates';
import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import { Form, FormControl, FormField, FormItem } from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import MultipleSelector from '@app/components/molecules/MultiSearchSelect';
import SelectedCard from '@app/components/molecules/SelectedCard';
import { SubmitButton } from '@app/components/molecules/SubmitButton';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import { templateCreatedAtom } from '@app/store/loaclStore';

import TriggerForm from './components/TriggerForm';
import { useAtom } from 'jotai';
import { ErrorToast } from '@app/components/molecules/CustomToasts';

export interface ITemplateOption {
    value: string;
    label: string;
    disable?: boolean;
    extraValues?: any;
    fixed?: boolean;
    parameters: IParameter[];
    cronParameters?: { [key: string]: string }[];
    cronExpression?: string[];
    [key: string]: string | boolean | undefined | object;
}

export const templateFormSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    triggers: z.any()
});

export default function TemplateForm() {
    const [submittingForm, setSubmittingForm] = useState(false);
    const [templateCreated , setTemplateCreated] = useAtom(templateCreatedAtom)
    
    const templateMutation = useMutation({
        mutationFn: (data: z.infer<typeof templateFormSchema>) =>
            postTemplateData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['templates'] });
            router.push('/templates');
            setTemplateCreated(true)
        },
        onError: () => {
            setSubmittingForm(false);
            console.log('Error Response');
            ErrorToast('Error in Creating Template. Try Again!')
        }
    });

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

    /* Related to saving parameter fromt the dialog popup*/
    function updateSelected({
        inputLabel,
        inputCronParameters,
        inputCronExpression
    }: {
        inputLabel: string;
        inputCronParameters: { [key: string]: string }[];
        inputCronExpression: string[];
    }) {
        const newSelected: ITemplateOption[] = selected.map(
            (item): ITemplateOption =>
                item.label === inputLabel
                    ? {
                          ...item,
                          cronParameters: inputCronParameters,
                          cronExpression: inputCronExpression
                      }
                    : item
        );
        setDialogOpen(false);
        setSelected(newSelected);
        form.setValue('triggers', newSelected);
    }

    const router = useRouter();


    function onSubmit(formData: z.infer<typeof templateFormSchema>) {
        console.log(formData);
        setSubmittingForm(true);
        templateMutation.mutateAsync(formData);
    }
    function renderSelectedFunctionsCard(){
        return  <div className="grid w-[80%] grid-cols-2 gap-4">
        {selected.map((option: ITemplateOption, index) => {
            return (
                <SelectedCard
                    name={option.value}
                    description={'NA'}
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
    }

    return (
        <>
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
                            <div className="mt-3 w-[297px]">
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
                       {renderSelectedFunctionsCard()}
                        <SubmitButton disabled={submittingForm} />
                    </form>
                </Form>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent>
                    <TriggerForm
                        formValues={selected.find(
                            (elem) => elem.value === currentDialogForm
                        )}
                        setClose={() => {
                            /* Remove selected option if user does not save the dialog form*/
                            const newSelected = selected.filter(
                                (item) => item.label != currentDialogForm
                            );
                            setSelected(newSelected);

                            /* Call unselect inside the multi selector search component*/
                            const optionToUnselect = selected.find(
                                (option) => option.label === currentDialogForm
                            );
                            if (optionToUnselect) {
                                functionRef.current.handleUnselect(optionToUnselect);
                            }

                            setDialogOpen(false);
                        }}
                        parameters={
                            selected.find((elem) => elem.value === currentDialogForm)
                                ?.parameters
                        }
                        onSave={updateSelected}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}