'use client';

import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import MultipleSelector, { IOption } from '@app/components/molecules/MultiSearchSelect';
import { NumberInput } from '@app/components/molecules/NumberInput';
import SelectedCard from '@app/components/molecules/SelectedCard';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplates, ITemplate } from '@app/app/api/templates';

const agentFormSchema = z.object({
    agentName: z.string(),
    agentTemplate: z.any(),
    numberOfAgents: z.number().min(1)
});

/*const AgentTemplateOptions: IOption[] = [
    { label: 'Default Template', value: 'Default Template' },
    { label: 'Template01', value: 'Template1' },
    { label: 'Test Template', value: 'Test Template' }
];*/


export default function CreateAgentForm() {
    const [selected, setSelected] = useState<IOption[]>([]);

    const [agentTemplateOptions , setAgentTemplateOptions]  = useState<IOption[]|[]>([])
    const {data : templates } = useQuery({queryKey:["templates"] , queryFn:fetchTemplates})
    
    useEffect(() => {
        if (templates) {
          setAgentTemplateOptions(templates.map((item: ITemplate) : IOption => ({
            label: item.name,
            value: item.id
          })));
        }
      }, [templates]);

    const form = useForm<z.infer<typeof agentFormSchema>>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            numberOfAgents: 1
        }
    });
    const multiSelectorRef = useRef<any>(null);

    function onSubmit(formData: z.infer<typeof agentFormSchema>) {
        console.log('Logging Form Data');
        console.log(formData);
    }

    function unselectOption(option: IOption) {
        const filteredSelected = selected.filter((s) => s.value !== option.value);
        setSelected(filteredSelected);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-[790px] min-h-[493px] '>
                <Card className="w-full h-full">
                    <FormField
                        control={form.control}
                        name="agentName"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Agent Name</Label>
                                <FormControl>
                                    <Input
                                        placeholder="Enter Agent Name"
                                        className="mt-3 w-72"
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
                                <Label className="mt-10 inline-flex">
                                    Agent Template
                                </Label>
                                <FormControl>
                                    <div className="mt-5 w-72">
                                        <MultipleSelector
                                            placeholder="Add Agent Template"
                                            options={agentTemplateOptions}
                                            appearOnTop={true}
                                            maxSelected={1}
                                            {...field}
                                            ref={multiSelectorRef}
                                            onChange={(option : IOption) => {setSelected([option])}}
                                            onUnselect={unselectOption}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="mt-2 grid w-[80%] grid-cols-2 gap-4">
                        {selected.map((option: IOption, index) => {
                            return (
                                <SelectedCard
                                    templateName={option.label}
                                    templateDescription={option.value}
                                    key={index}
                                    handleEdit={() => {
                                        console.log('Handle Template edit');
                                    }}
                                    handleUnselect={() => {
                                        multiSelectorRef.current.handleUnselect(option);
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
                                <Label className="mt-10 inline-flex">
                                    Number of Agents
                                </Label>
                                <FormControl>
                                    <NumberInput
                                        className="mt-5 h-9 w-28"
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
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="mt-12 w-36"
                    >
                        Create
                    </Button>
                </Card>
            </form>
        </Form>
    );
}
