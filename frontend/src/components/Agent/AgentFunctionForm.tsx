import { useState } from 'react';

import { IAgent, TriggerType } from '@api/agents';
import { postTrigger } from '@api/trigger';
import { ITriggerCreateDto } from '@api/trigger';
import { IFunctionsItem } from '@models/types/functions';
import { TemplateFunctions } from '@models/types/functions';
import { Dialog, DialogContent } from '@mui/material';
import { SelectTrigger } from '@radix-ui/react-select';
import { useMutation } from '@tanstack/react-query';
import { ChevronDown, X } from 'lucide-react';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import { mapConfiguredFunctionToTriggerCreateDTO } from '@app/app/(pages)/templates/create-template/components/utils/FunctionUtil';
import { IConfiguredFunctionsItem } from '@app/app/(pages)/templates/create-template/page';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Select, SelectContent, SelectItem } from '../atoms/Select';
import { ErrorToast, SuccessToast } from '../molecules/CustomToasts';

export default function AgentFunctionForm({
    dialogOpen,
    selectedFunction,
    onClose,
    agent
}: {
    dialogOpen: boolean;
    selectedFunction?: IFunctionsItem;
    onClose: any;
    agent?: IAgent | null;
}) {
    const defaultFunction: IConfiguredFunctionsItem = {
        ...TemplateFunctions[0],
        index: '0',
        type: 'CRON' as TriggerType
    };

    const [currentSelectedFunction, setCurrentSelectedFunction] =
        useState<IConfiguredFunctionsItem | null>(
            selectedFunction
                ? { ...selectedFunction, index: '0', type: 'CRON' as TriggerType }
                : defaultFunction
        );

    const handleFunctionsSelect = (functionID: string) => {
        const selectedFunction = TemplateFunctions.find(
            (func) => func.id === functionID
        );
        if (selectedFunction) {
            const currentSelectedFunction = {
                ...selectedFunction,
                index: '0',
                type: 'CRON' as TriggerType,
                cronValue: { frequency: '* * * * *', probability: 100 }
            };
            setCurrentSelectedFunction(currentSelectedFunction);
        }
    };

    const functionMutation = useMutation({
        mutationFn: (data: ITriggerCreateDto) => postTrigger(agent?.id || '', data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`agent${agent?.id}`] });
            onClose();
            setCurrentSelectedFunction(defaultFunction);
            SuccessToast('Function Added Successfully');
        },
        onError: () => {
            ErrorToast('Something went wrong!');
        }
    });

    const handlePostTrigger = (item: IConfiguredFunctionsItem) => {
        if (currentSelectedFunction) {
            const triggerData = mapConfiguredFunctionToTriggerCreateDTO(item);
            if (triggerData) {
                functionMutation.mutate(triggerData);
            }
        }
    };

    const HeaderTabs = () => {
        return (
            <div className={'mt-8 flex flex-col gap-2 bg-transparent px-4'}>
                <span className="h4">Function</span>
                <Select onValueChange={(value: string) => handleFunctionsSelect(value)}>
                    <SelectTrigger className="flex items-center justify-between bg-white px-2 py-1 text-start">
                        {currentSelectedFunction?.name}
                        <ChevronDown />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {TemplateFunctions.map((item, index) => (
                            <SelectItem key={index} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };
    return (
        <Dialog open={dialogOpen}>
            <DialogContent className="bg- relative bg-brand-Azure-400 !p-0">
                <X
                    className="absolute right-4 top-4 hover:cursor-pointer"
                    onClick={onClose}
                />
                {/* <HeaderTabs/> */}
                {currentSelectedFunction && (
                    <FunctionForm
                        // currentFunction={currentSelectedFunction}
                        onClose={() => {}}
                        onValueChange={() => {}}
                        onSave={(item: IConfiguredFunctionsItem) => {
                            handlePostTrigger(item);
                        }}
                        hideFormHeader={true}
                        btnPlaceholder={'Add Function'}
                        renderFunctionSelector={true}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
