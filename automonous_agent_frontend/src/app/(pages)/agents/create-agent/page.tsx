'use client';

import { useEffect, useRef, useState } from 'react';

import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { postAgentData } from '@app/app/api/agents';
import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
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
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import MultipleSelector, { IOption } from '@app/components/molecules/MultiSearchSelect';
import { NumberInput } from '@app/components/molecules/NumberInput';
import SelectedCard from '@app/components/molecules/SelectedCard';
import toast , {Toaster} from 'react-hot-toast'
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import { SubmitButton } from '@app/components/molecules/SubmitButton';
import { useAtom } from 'jotai'
import { agentCreatedAtom } from '@app/store/loaclStore';
import { ErrorToast } from '@app/components/molecules/CustomToasts';

export const agentFormSchema = z.object({
    agentName: z.string(),
    agentTemplate: z.string(),
    numberOfAgents: z.number().min(1)
});

export default function CreateAgentForm() {
    const [selected, setSelected] = useState<IOption[]>([]);
    const [agentCreated , setAgentCreated] = useAtom(agentCreatedAtom)

    const [agentTemplateOptions, setAgentTemplateOptions] = useState<IOption[] | []>(
        []
    );
    const { data: templates } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });

    useEffect(() => {
        if (templates) {
            setAgentTemplateOptions(
                templates.map(
                    (item: ITemplate): IOption => ({
                        label: item.name,
                        value: item.id
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
            console.log('Agent Posted')
            queryClient.refetchQueries({queryKey:['agents']})
            setAgentCreated(true)
            router.push('/agents')
        },
        onError: () => {
            console.log('Error Response')
            ErrorToast('Error while creating Agent. Try Again!')
        }
    });
    
    const [submittingForm , setSubmittingForm] = useState(false)

    async function onSubmit(formData: z.infer<typeof agentFormSchema>) {
        setSubmittingForm(true)
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
                        'flex min-h-[493px] w-[790px] flex-col justify-between',
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
                                            className="mt-3 h-[38px] w-[297px]"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agentTemplate"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="inline-flex">
                                        Agent Template
                                    </Label>
                                    <FormControl>
                                        <div className="h-[40px] w-[297px]">
                                            <MultipleSelector
                                                placeholder="Add Agent Template"
                                                options={agentTemplateOptions}
                                                appearOnTop={true}
                                                maxSelected={1}
                                                ref={multiSelectorRef}
                                                onChange={(option: IOption) => {
                                                    setSelected([option]);
                                                    console.log(selected[0]);
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
                                        description={option.value}
                                        key={index}
                                        handleEdit={() => {
                                            console.log('Handle Template edit');
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
                    <SubmitButton disabled={submittingForm}/>
                </Card>
            </form>
        </Form>
    );
}
