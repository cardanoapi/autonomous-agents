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
import SelectedTemplateCard from '@app/components/molecules/SelectedTemplateCard';
import { SelectorAtom } from '@app/components/molecules/MultiSearchSelect';
import TriggerForm from './function-triggers/TriggerForm';
import { useAtom } from 'jotai';

const templateFormSchema = z.object({
    templateName: z.string(),
    templateDescription: z.string().optional(),
    agentRole: z.any(),
    triggers: z
        .object({
            address: z.string().optional(),
            amount: z.string().optional()
        })
        .optional()
});

export default function TemplateForm() {
    const [selected, setSelected] = useAtom(SelectorAtom)

    const functionRef = useRef<any>(null);

    const form = useForm<z.infer<typeof templateFormSchema>>({
        resolver: zodResolver(templateFormSchema)
    });

    function onSubmit(formData: z.infer<typeof templateFormSchema>) {
        console.log(functionRef.current?.selectedValue);
        console.log(formData);
    }

    const AgentFunctionOptions: IOption[] = [
        { label: 'Send Ada', value: 'SendAda' },
        { label: 'Create Proposal', value: 'CreatePropsal' },
        { label: 'Vote Propsal', value: 'VotePropsal' },
        { label: 'Burn Token', value: 'BurnToken' }
    ];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [triggers, setTriggers] = useState('');
    const [formValues, setFormValues] = useState([]);

    const multiSelectRef = useRef<{ selected: IOption[] } | null>(null);

    useEffect(() => {
        console.log('Selected value changed');
        console.log(functionRef?.current?.selectedValue);
    }, [functionRef]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="w-[790px]">
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
                                            options={AgentFunctionOptions}
                                            placeholder="Add Agent Function"
                                            className="mt-3 w-[297px]"
                                            appearOnTop={true}
                                            setDialogOpen={setDialogOpen}
                                            // onSelect = {setSelected}
                                            {...field}
                                            ref={functionRef}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="grid w-[40vw] grid-cols-2 gap">
                        {selected.map((option: IOption) => {
                            return (
                                <SelectedTemplateCard
                                    templateName={option.value}
                                    handleUnselect={() => {
                                        functionRef.current.handleUnselect(option);
                                    }}
                                />
                            );
                        })}
                    </div>
                    <Dialog open={dialogOpen}>
                        <DialogContent className="p-12">
                            <TriggerForm
                                functionName={'Send Ada Function'}
                                // TODO: onFormSubmit = setFormValues
                                setClose={() => {
                                    setDialogOpen(false);
                                }}
                                formControl={form.control}
                            />
                        </DialogContent>
                    </Dialog>

                    <Button variant="primary" size="md" className="mt-6" type="submit">
                        Create Template
                    </Button>
                </Card>
            </form>
        </Form>
    );
}
