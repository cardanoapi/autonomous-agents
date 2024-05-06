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
import { Label } from '@app/components/atoms/label';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@app/components/atoms/Form';
import MultipleSelector, {
    IMultipleSelectorRef,
    IOption
} from '@app/components/molecules/MultiSearchSelect';
import SelectedTemplateCard from '@app/components/molecules/SelectedTemplateCard';

import TriggerForm, { triggerFormSchema } from './function-triggers/TriggerForm';

const templateFormSchema = z.object({
    templateName: z.string(),
    templateDescription: z.string().optional(),
    agentRole: z.any()
});

export default function TemplateForm() {
    
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
    
    const [selected, setSelected] = useState<IOption[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentDialogForm , setCurrentDialogForm] = useState<IOption|null>(null)

    function openSelectedOption(option: IOption){
        console.log(option)
        setCurrentDialogForm(option)
        setDialogOpen(true)
    }

    function updateFormData(formData: z.infer<typeof triggerFormSchema>, option: IOption) {
        const newoption : IOption = {...option , extraValues : { 'address' : formData.address , 'amount' : formData.amount}}
        const updatedSelection = {
            ...selected,
            option: {
                ...option,
                newoption
            }
        };
        console.log(selected)
    }    

    {
        /* useEffect(
        ()=> {
            if (selected.length != 0){
                setDialogOpen(true)
            }
        }
    , [selected,]) */
    }

    { /*{useEffect(()=>{
        console.log('useeffect')
        console.log(selected)
    },[selected,])}*/ }

    return (
        <>
            <Dialog open={dialogOpen}>
                <DialogContent className="p-12">
                    <TriggerForm
                        functionName={currentDialogForm?.label}
                        // TODO: onFormSubmit = setFormValues
                        setClose={() => {
                            setDialogOpen(false);
                        }}
                        onSave={setCurrentDialogForm}
                    />
                </DialogContent>
            </Dialog>
            <Card className="w-[790px]">
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
                                                options={AgentFunctionOptions}
                                                placeholder="Add Agent Function"
                                                className="mt-3 w-[297px]"
                                                appearOnTop={true}
                                                {...field}
                                                ref={functionRef}
                                                onChange={setSelected}
                                                openSelectedOption={openSelectedOption}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                </form>
            </Form>
            <div className="grid grid-cols-2 w-[80%] gap-4 mt-2">
                {selected.map((option: IOption, index) => {
                    return (
                                <SelectedTemplateCard
                                    templateName={option.value}
                                    handleEdit={()=>{
                                        openSelectedOption(option)
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
