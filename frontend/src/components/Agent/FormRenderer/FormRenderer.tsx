import React from 'react';

import { AgentTriggerRequestData, IAgent, manualTriggerForAgent } from '@api/agents';
import { AgentTriggerFunctionType } from '@models/types';
import { IParameter } from '@models/types/functions';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import FormParameters from '@app/components/Agent/FormRenderer/FormParameters';
import { Button } from '@app/components/atoms/Button';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { Separator } from '@app/components/shadcn/ui/separator';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';
import {
    extractAnswerFromForm,
    validateForDifferentType
} from '@app/utils/formRenderer';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

const FormRenderer = ({
    closeModal,
    agent
}: {
    closeModal: (boolVal: boolean) => void;
    agent?: IAgent;
    handleClose?: any;
}) => {
    const [selectedFunction] = useAtom(selectedFunctionAtom);
    const [, setErrorIndex] = useAtom(errorAtom);
    const agentMutation = useMutation({
        mutationFn: (data: {
            agentId: string;
            agentFunction: AgentTriggerRequestData;
        }) => manualTriggerForAgent(data.agentId, data.agentFunction),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            SuccessToast(
                `${selectedFunction ? selectedFunction.name : 'Transfer Ada'} has been successfully triggered.`
            );
            closeModal(false);
        },
        onError: () => {
            console.log('Error Response');
            ErrorToast('Error while manually triggering Agent Function. Try Again!');
        }
    });
    const handleTrigger = async () => {
        const errorIndexes = await checkIfRequiredFieldIsEmpty(
            selectedFunction?.parameters
        );
        setErrorIndex(errorIndexes);
        if (!errorIndexes.length) {
            const params = extractAnswerFromForm(selectedFunction);
            await agentMutation.mutateAsync({
                agentId: agent?.id || '',
                agentFunction: {
                    function_name:
                        (selectedFunction?.id as AgentTriggerFunctionType) ||
                        'transferADA',
                    parameters: params
                }
            });
        }
    };

    async function checkIfRequiredFieldIsEmpty(params?: Array<IParameter>) {
        const errorIndexes: number[] = [];
        if (params?.length) {
            await Promise.all(
                params.map(async (param, index) => {
                    const isValid = await validateForDifferentType(param);
                    if (!isValid) {
                        errorIndexes.push(index);
                    }
                })
            );
        }
        return errorIndexes;
    }

    return (
        <div className={'h-full max-h-[680px] w-full overflow-auto'}>
            <div className={'px-6 py-2 text-lg font-medium'}>Manual Trigger</div>
            <Separator className={''} />
            <ScrollArea className={'h-modalHeight overflow-y-auto'}>
                <div className={'flex flex-col gap-4 px-6 py-2'}>
                    <div className={'flex flex-col gap-1'}>
                        <span className={'font-medium text-brand-Black-300'}>
                            {selectedFunction?.name}
                        </span>
                        <span className={'text-sm text-brand-Black-300/80'}>
                            {selectedFunction?.description}
                        </span>
                    </div>
                    {selectedFunction && selectedFunction.parameters && (
                        <FormParameters parameters={selectedFunction.parameters} />
                    )}
                    <div className={'flex justify-end gap-2'}>
                        <Button
                            variant={'danger'}
                            onClick={() => {
                                closeModal(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => handleTrigger()} variant={'primary'}>
                            Trigger
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default FormRenderer;
