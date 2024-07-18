'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDialog } from '@hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { templateFormSchema } from '@app/app/(pages)/templates/create-template/components/schema';
import { IFunction, IParameter, fetchFunctions } from '@app/app/api/functions';
import { postTemplateData } from '@app/app/api/templates';
import { Card } from '@app/components/atoms/Card';
import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import { Form, FormControl, FormField, FormItem } from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import MultipleSelector from '@app/components/molecules/MultiSearchSelect';
import SelectedCard from '@app/components/molecules/SelectedCard';
import { SubmitButton } from '@app/components/molecules/SubmitButton';
import { templateCreatedAtom } from '@app/store/localStore';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import TriggerForm from './components/TriggerForm';

export interface ITemplateOption {
    value: string;
    label: string;
    disable?: boolean;
    extraValues?: any;
    fixed?: boolean;
    parameters: IParameter[];
    cronParameters?: IParameter[];
    cronExpression?: string[];
    defaultSelected?: any;
    configuredSettings?: any;
    probability?: number;
    type?: string;

    [key: string]: string | boolean | undefined | object | number;
}

export default function TemplateForm() {
    const [submittingForm, setSubmittingForm] = useState(false);
    const [, setTemplateCreated] = useAtom(templateCreatedAtom);

    const templateMutation = useMutation({
        mutationFn: (data: z.infer<typeof templateFormSchema>) =>
            postTemplateData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['templates'] });
            router.push('/templates');
            setTemplateCreated(true);
        },
        onError: (error: any) => {
            setSubmittingForm(false);
            ErrorToast(error?.response?.data);
        }
    });

    const form = useForm<z.infer<typeof templateFormSchema>>({
        resolver: zodResolver(templateFormSchema)
    });

    /*Related to Function Options*/
    const functionRef = useRef<any>(null);
    const { data: functions } = useQuery<Record<string, IFunction[]>>({
        queryKey: ['functions'],
        queryFn: fetchFunctions
    });
    const [functionOptions, setFunctionOptions] = useState<any[] | []>([]);

    /*Related to Popup dialog */
    const { isOpen, toggleDialog } = useAppDialog();
    const [currentDialogForm, setCurrentDialogForm] = useState<ITemplateOption | null>(
        null
    );

    /*Related to Selected option*/
    const [selected, setSelected] = useState<ITemplateOption[]>([]);

    function openSelectedOption(option: ITemplateOption) {
        console.log(option);
        setCurrentDialogForm(option);
        toggleDialog();
    }

    function unselectOption(option: ITemplateOption) {
        const filteredSelected = selected.filter((s) => s.value !== option.value);
        setSelected(filteredSelected);
    }

    /* Sets fetched functions as options for the dropdown */
    useEffect(() => {
        if (functions) {
            setFunctionOptions(
                Object.values(functions)
                    .flat()
                    .filter((item: IFunction): any => item.num_parameters != 0)
                    .map((item: IFunction): any => ({
                        label: item.name,
                        value: item.name,
                        parameters: item.parameters
                    }))
            );
        }
    }, [functions]);

    /* Related to saving parameter fromt the dialog popup*/
    function updateSelected({
        inputType,
        inputLabel,
        inputCronParameters,
        inputCronExpression,
        inputDefaultSelected,
        inputDefaultSettings,
        inputProbability
    }: {
        inputType: string;
        inputLabel: string;
        inputCronParameters: IParameter[];
        inputCronExpression: string[];
        inputDefaultSelected: string;
        inputDefaultSettings: any;
        inputProbability: number;
    }) {
        const newSelected: ITemplateOption[] = selected.map(
            (item): ITemplateOption =>
                item.label === inputLabel
                    ? {
                          ...item,
                          type: inputType ? inputType : 'CRON',
                          cronParameters: inputCronParameters,
                          cronExpression: inputCronExpression,
                          defaultSelected: inputDefaultSelected,
                          configuredSettings: inputDefaultSettings,
                          parameters: inputCronParameters,
                          probability: inputProbability / 100
                      }
                    : item
        );
        toggleDialog();
        setSelected(newSelected);
        form.setValue('triggers', newSelected);
    }

    const router = useRouter();

    function onSubmit(formData: z.infer<typeof templateFormSchema>) {
        console.log(formData);
        setSubmittingForm(true);
        templateMutation.mutateAsync(formData);
    }

    function renderSelectedFunctionsCard() {
        return (
            <div className="grid w-[80%] grid-cols-2 gap-4">
                {selected.map((option: ITemplateOption, index) => {
                    return (
                        <SelectedCard
                            name={option.value}
                            description={option.value}
                            key={index}
                            handleEdit={() => {
                                openSelectedOption(option);
                            }}
                            handleUnselect={() => {
                                const currentFormTriggers = form.getValues('triggers');
                                const newTriggers = currentFormTriggers.filter(
                                    (item: any) => item.value != option.value
                                );
                                form.setValue('triggers', newTriggers);
                                functionRef.current.handleUnselect(option);
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
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
                                            className="h-[38px] w-full"
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
                                            className="mt-3 h-[123px] w-full"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div>
                            <Label className=" inline-block">Agent Behaviour</Label>
                            <div className="mt-3 w-full">
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
            <Dialog open={isOpen}>
                <DialogContent className="!p-0" defaultCross={true}>
                    <TriggerForm
                        //@ts-ignore
                        formValues={selected.find((elem) => elem === currentDialogForm)}
                        setClose={() => {
                            /* Remove selected option if user does not save the dialog form*/
                            const newSelected = selected.filter(
                                (item) => item != currentDialogForm
                            );
                            setSelected(newSelected);

                            /* Call unselect inside the multi selector search component*/
                            const optionToUnselect = selected.find(
                                (option) => option === currentDialogForm
                            );
                            if (optionToUnselect) {
                                functionRef.current.handleUnselect(optionToUnselect);
                            }

                            toggleDialog();
                        }}
                        parameters={currentDialogForm?.parameters}
                        onSave={updateSelected}
                        defaultCron={currentDialogForm?.cronExpression}
                        previousSelectedOption={
                            currentDialogForm?.defaultSelected?.length == 0
                                ? ' '
                                : currentDialogForm?.defaultSelected
                        }
                        previousConfiguredSettings={
                            currentDialogForm?.configuredSettings
                        }
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
