'use client';

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
import { NumberInput } from '@app/components/molecules/NumberInput';
import MultipleSelector, { Option } from '@app/components/molecules/MultiSearchSelect';

const agentFormSchema = z.object({
    agentName: z.string(),
    agentTemplate: z.any(),
    numberOfAgents: z.number().min(1)
});

export default function CreateAgentForm() {
    const AgentTemplateOptions: Option[] = [
        { label: 'Default Template', value: 'Default Template' },
        { label: 'Template01', value: 'Template1' },
        { label: 'Test Template', value: 'Test Template' }
    ];

    const form = useForm<z.infer<typeof agentFormSchema>>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            numberOfAgents: 1
        }
    });

    function onSubmit(formData: z.infer<typeof agentFormSchema>) {
        console.log('Logging Form Data');
        console.log(formData);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="min-h-[493px] w-[790px]">
                    <FormField
                        control={form.control}
                        name="agentName"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Agent Name</Label>
                                <FormControl>
                                    <Input
                                        placeholder="Enter Agent Name"
                                        className="mt-3 w-[297px]"
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
                                <Label className="mt-6 inline-flex">
                                    Agent Template
                                </Label>
                                <FormControl>
                                    <div className="mt-3 w-[297px]">
                                        <MultipleSelector
                                            placeholder="Add Agent Template"
                                            options={AgentTemplateOptions}
                                            appearOnTop={true}
                                            maxSelected={1}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="numberOfAgents"
                        render={({ field }) => (
                            <FormItem>
                                <Label className="mt-6 inline-flex">
                                    Number of Agents
                                </Label>
                                <FormControl>
                                    <NumberInput
                                        className="mt-3 h-9 w-28"
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
                        className="mt-6 w-[145px]"
                    >
                        Create
                    </Button>
                </Card>
            </form>
        </Form>
    );
}
