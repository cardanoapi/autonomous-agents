'use client';

import React from 'react';
import { useState } from 'react';

import { ICronTrigger, IEventTrigger, TriggerType } from '@api/agents';
import { ICreateTemplateRequestDTO, postTemplateData } from '@api/templates';
import { ITriggerCreateDto } from '@api/trigger';
import {
    IFunctionsItem,
    IParameterOption,
    TemplateFunctions
} from '@models/types/functions';
import { Dialog, DialogContent } from '@mui/material';
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

import { FunctionCards } from './components/FunctionCards';
import { FunctionForm } from './components/FunctionForm';
import { mapToTriggerCreateDTO } from './components/FunctionUtil';

export interface IConfiguredFunctionsItem extends IFunctionsItem {
    index: string; // for identifying function instance , id attribute holds function name
    type: TriggerType;
    cronValue?: ICronTrigger;
    eventValue?: IEventTrigger;
    optionValue?: IParameterOption;
    //for saving cron settings
    selectedCronOption?: string;
    congifuredCronSettings?: any;
}

interface IFormData {
    name: string;
    description: string;
    functions: IConfiguredFunctionsItem[];
}

export default function CreateTemplatePage() {
    const [mainState, setMainState] = useState<IFormData>({
        name: '',
        description: '',
        functions: []
    });

    const [currentSelectedFunction, setCurrentSelectedFunction] =
        useState<IConfiguredFunctionsItem | null>(null);

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
        const newFunctions = [...mainState.functions, currentFunction];
        setCurrentSelectedFunction(currentFunction);
        setMainState({
            ...mainState,
            functions: newFunctions
        });
        setIsDialogOpen(true);
    };

    const handleDeleteFunction = (inputFunction: IConfiguredFunctionsItem) => {
        const newFunctions = mainState.functions.filter(
            (functionItem) => functionItem.index !== inputFunction.index
        );
        setMainState({
            ...mainState,
            functions: newFunctions
        });
    };

    const handleDialogClose = () => setIsDialogOpen(false);

    const handleSaveFunction = (item: IConfiguredFunctionsItem) => {
        console.log(item);
        const newFunctions = mainState.functions.map((functionItem) =>
            functionItem.index === item.index ? item : functionItem
        );
        console.log(newFunctions);
        setMainState({ ...mainState, functions: newFunctions });
        handleDialogClose();
    };

    const handleEditFunction = (item: IConfiguredFunctionsItem) => {
        setCurrentSelectedFunction(item);
        setIsDialogOpen(true);
    };

    // const handleSubmit = () => {
    //     const template_triggers : ITriggerCreateDto = mainState.functions.map((functionItem) => ({

    //     }))
    // }

    const handleTemplateSubmit = () => {
        const templateRequest: ICreateTemplateRequestDTO = {
            name: mainState.name,
            description: mainState.description,
            template_triggers: mapToTriggerCreateDTO(mainState.functions)
        };
        console.log(templateRequest);
        postTemplateData({ data: templateRequest });
    };

    return (
        <>
            <Card className="flex min-h-[493px] w-[790px] flex-col gap-4">
                <div>
                    <Label>Template Name </Label>
                    <Input
                        placeholder="Enter Template Name"
                        className="h-[38px] w-full"
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
                <div className="grid w-full grid-cols-2 gap-4">
                    <FunctionCards
                        functions={mainState.functions}
                        onUnselect={handleDeleteFunction}
                        onEdit={handleEditFunction}
                    />
                </div>
                <Button
                    variant="primary"
                    className="mt-6 min-w-36"
                    size="md"
                    type="submit"
                    onClick={() => {
                        handleTemplateSubmit();
                    }}
                >
                    Create Template
                </Button>
            </Card>
            <Dialog open={isDialogOpen}>
                <DialogContent className="!p-0">
                    {currentSelectedFunction && (
                        <FunctionForm
                            currentFunction={currentSelectedFunction}
                            onClose={handleDialogClose}
                            onValueChange={() => {}}
                            onSave={(item: IConfiguredFunctionsItem) => {
                                handleSaveFunction(item);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
