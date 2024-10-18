'use client';

import React from 'react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ICronTrigger, IEventTrigger, TriggerType } from '@api/agents';
import { ICreateTemplateRequestDTO, postTemplateData } from '@api/templates';
import {
    IFunctionsItem,
    IParameterOption,
    TemplateFunctions
} from '@models/types/functions';
import { Dialog, DialogContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { v4 } from 'uuid';

import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { templateCreatedAtom } from '@app/store/localStore';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { FunctionCards } from './components/FunctionCards';
import { FunctionForm } from './components/FunctionForm';
import { mapFormFunctionToTriggerConfiguration } from './components/utils/FunctionMapper';

export interface IFormFunctionInstance extends IFunctionsItem {
    index: string; // for identifying function instance , id attribute holds function name
    type: TriggerType;
    cronValue?: ICronTrigger;
    eventValue?: IEventTrigger;
    optionValue?: IParameterOption;
    //for saving cron settings
    selectedCronOption?: string;
    congifuredCronSettings?: any;
    //To be compatible with IAgentConfiuration
    agent_id?: string;
}

interface IFormData {
    name: string;
    description: string;
    functions: IFormFunctionInstance[];
}

export default function CreateTemplatePage() {
    const router = useRouter();
    const [submittingForm, setSubmittingForm] = useState(false);
    const [, setTemplateCreated] = useAtom(templateCreatedAtom);

    const [mainState, setMainState] = useState<IFormData>({
        name: '',
        description: '',
        functions: []
    });

    const templateMutation = useMutation({
        mutationFn: (data: ICreateTemplateRequestDTO) =>
            postTemplateData({ data: data }),
        onSuccess: () => {
            new Promise((resolve) => setTimeout(resolve, 1000));
            queryClient.refetchQueries({ queryKey: ['templates'] });
            router.push('/templates');
            setTemplateCreated(true);
        },
        onError: (error: any) => {
            setSubmittingForm(false);
            ErrorToast(error?.response?.data);
        }
    });

    const [currentSelectedFunction, setCurrentSelectedFunction] =
        useState<IFormFunctionInstance | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleUpdateMainState = (key: string, value: any) => {
        setMainState({
            ...mainState,
            [key]: value
        });
    };

    const handleAddFunction = (inputFunction: IFunctionsItem) => {
        const currentFunction = {
            ...inputFunction,
            index: v4(),
            type: 'CRON' as TriggerType,
            cronValue: { frequency: '* * * * *', probability: 100 }
        };
        setCurrentSelectedFunction(currentFunction);
        setIsDialogOpen(true);
    };

    const handleDeleteFunction = (inputFunction: IFormFunctionInstance) => {
        const newFunctions = mainState.functions.filter(
            (functionItem) => functionItem.index !== inputFunction.index
        );
        setMainState({
            ...mainState,
            functions: newFunctions
        });
    };

    const handleDialogClose = () => setIsDialogOpen(false);

    const handleSaveFunction = (item: IFormFunctionInstance) => {
        const newFunctions = mainState.functions.map((functionItem) =>
            functionItem.index === item.index ? item : functionItem
        );
        const indexExists = newFunctions.some(
            (functionItem) => functionItem.index === item.index
        );
        if (!indexExists) {
            newFunctions.push(item);
        }
        setMainState({ ...mainState, functions: newFunctions });
        handleDialogClose();
    };

    const handleEditFunction = (item: IFormFunctionInstance) => {
        setCurrentSelectedFunction(item);
        setIsDialogOpen(true);
    };

    const handleTemplateSubmit = () => {
        if (!mainState.name) {
            ErrorToast('Template name is required');
            return;
        }

        if (!mainState.description) {
            ErrorToast('Template description is required');
            return;
        }

        const templateRequest: ICreateTemplateRequestDTO = {
            name: mainState.name,
            description: mainState.description,
            template_triggers: mainState.functions.map((func)=> mapFormFunctionToTriggerConfiguration(func))
        };
        setSubmittingForm(true);
        templateMutation.mutate(templateRequest);
    };

    return (
        <>
            <Card className="flex min-h-[493px] w-[790px] flex-col gap-4">
                <div>
                    <Label>Template Name </Label>
                    <Input
                        placeholder="Enter Template Name"
                        className="mt-3 h-[38px] w-full"
                        value={mainState.name}
                        onChange={(e) => handleUpdateMainState('name', e.target.value)}
                    />
                </div>
                <div>
                    <Label className="inline-block">Template Description</Label>
                    <Textarea
                        placeholder="Text..."
                        className="mt-3 h-[123px] w-full"
                        value={mainState.description}
                        onChange={(e) =>
                            handleUpdateMainState('description', e.target.value)
                        }
                    />
                </div>
                <div>
                    <Label className=" inline-block">Template Functions</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="mt-3 flex w-full justify-between rounded-lg border-2 border-brand-border-300 p-2 text-base text-gray-400">
                            Add Function
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-[--radix-popper-anchor-width]  hover:cursor-pointer">
                            {TemplateFunctions.map(
                                (templateFunction, index: number) => (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleAddFunction(templateFunction)
                                        }
                                        key={index}
                                    >
                                        {templateFunction.name}
                                    </DropdownMenuItem>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Render Selcted Configured Functions */}
                <div className="grid w-full grid-cols-2 gap-4">
                    <FunctionCards
                        functions={mainState.functions}
                        onUnselect={handleDeleteFunction}
                        onEdit={handleEditFunction}
                    />
                </div>
                <Button
                    variant="primary"
                    className="mt-6 w-36"
                    size="md"
                    type="submit"
                    onClick={() => {
                        handleTemplateSubmit();
                    }}
                    disabled={
                        submittingForm ||
                        !mainState.functions.length ||
                        !mainState.name ||
                        !mainState.description
                    }
                >
                    Create Template
                </Button>
            </Card>
            {/*Dialog for function form*/}
            <Dialog open={isDialogOpen}>
                <DialogContent className="!p-0">
                    {currentSelectedFunction && (
                        <FunctionForm
                            currentFunction={currentSelectedFunction}
                            onClose={handleDialogClose}
                            onValueChange={() => {}}
                            onSave={(item: IFormFunctionInstance) => {
                                handleSaveFunction(item);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
