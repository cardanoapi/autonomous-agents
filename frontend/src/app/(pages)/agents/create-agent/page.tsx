'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { postAgentData } from '@api/agents';
import { ITemplate, fetchTemplates } from '@api/templates';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { agentFormSchema } from '@app/app/(pages)/agents/create-agent/_form/schema';
import { Card } from '@app/components/atoms/Card';
import { Form, FormControl, FormField, FormItem } from '@app/components/atoms/Form';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import MultipleSelector, { IOption } from '@app/components/molecules/MultiSearchSelect';
import { NumberInput } from '@app/components/molecules/NumberInput';
import SelectedCard from '@app/components/molecules/SelectedCard';
import { SubmitButton } from '@app/components/molecules/SubmitButton';
import { agentCreatedAtom } from '@app/store/localStore';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

export default function CreateAgentForm() {
    const [selected, setSelected] = useState<IOption[]>([]);
    const [, setAgentCreated] = useAtom(agentCreatedAtom);
    const [submittingForm, setSubmittingForm] = useState(false);

    const [agentTemplateOptions, setAgentTemplateOptions] = useState<IOption[] | []>(
        []
    );
    const { data: templates } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: () => fetchTemplates({ page: 1, size: 50, search: '' })
    });

    useEffect(() => {
        if (templates) {
            setAgentTemplateOptions(
                templates.map(
                    (item: ITemplate): IOption => ({
                        label: item.name,
                        value: item.id,
                        description : item.description
                    })
                )
            );
        }
    }, [templates]);

    const form = useForm<z.infer<typeof agentFormSchema>>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            numberOfAgents: 1
        }
    });
    const multiSelectorRef = useRef<any>(null);

    const router = useRouter();

    const agentMutation = useMutation({
        mutationFn: (data: z.infer<typeof agentFormSchema>) => postAgentData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            setAgentCreated(true);
            router.push('/agents');
        },
        onError: () => {
            setSubmittingForm(false);
            ErrorToast('Error while creating Agent. Try Again!');
        }
    });

    async function onSubmit(formData: z.infer<typeof agentFormSchema>) {
        setSubmittingForm(true);
        await agentMutation.mutateAsync(formData);
    }

    function unselectOption(option: IOption) {
        const filteredSelected = selected.filter((s) => s.value !== option.value);
        setSelected(filteredSelected);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card
                    className={cn(
                        'flex lg:min-h-[493px] lg:w-[780px] flex-col justify-between max-md:p-6 max-md:py-4 max-md:pb-8',
                        selected.length === 0 ? 'pb-24' : ''
                    )}
                >
                    <div className="flex flex-col gap-y-8">
                        <FormField
                            control={form.control}
                            name="agentName"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Agent Name</Label>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Agent Name"
                                            className="mt-3 h-[38px] w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agentTemplate"
                            render={({}) => (
                                <FormItem>
                                    <Label className="inline-flex">
                                        Agent Template
                                    </Label>
                                    <FormControl>
                                        <div className="h-[40px] w-full">
                                            <MultipleSelector
                                                placeholder="Add Agent Template"
                                                options={agentTemplateOptions}
                                                appearOnTop={true}
                                                maxSelected={1}
                                                ref={multiSelectorRef}
                                                onChange={(option: IOption) => {
                                                    setSelected([option]);
                                                    form.setValue(
                                                        'agentTemplate',
                                                        option.value
                                                    );
                                                }}
                                                onUnselect={unselectOption}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className={selected.length === 0 ? 'hidden' : ''}>
                            {selected.map((option: IOption, index) => {
                                return (
                                    <SelectedCard
                                        name={option.label}
                                        description={option.description}
                                        key={index}
                                        handleEdit={() => {
                                            toast.error(
                                                'Template Editing is currently unavailable.'
                                            );
                                        }}
                                        handleUnselect={() => {
                                            multiSelectorRef.current.handleUnselect(
                                                option
                                            );
                                            form.resetField('agentTemplate');
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <FormField
                            control={form.control}
                            name="numberOfAgents"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="inline-flex">
                                        Number of Agents
                                    </Label>
                                    <FormControl>
                                        <NumberInput
                                            className="h-[38px] w-[138px]"
                                            {...field}
                                            type="number"
                                            onChange={(e) =>
                                                field.onChange(parseInt(e.target.value))
                                            }
                                            min={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <SubmitButton disabled={submittingForm} />
                </Card>
            </form>
        </Form>
    );
}
