import React, { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { validateInputField } from '@utils';

import { manualTriggerForAgent } from '@app/app/api/agents';
import { IFunction } from '@app/app/api/functions';
import FunctionParameters from '@app/components/Agent/FunctionParameters';
import { Button } from '@app/components/atoms/Button';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import { Separator } from '@app/components/shadcn/ui/separator';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { useModal } from '../context';

const AgentManualTriggerModalView = ({
    agentId,
    agentFunction
}: {
    agentId: string;
    agentFunction: IFunction;
}) => {
    const { closeModal } = useModal();

    const [errorParamIndex, setErrorParamIndex] = useState<Array<number>>([]);

    const params = agentFunction.parameters ?? [];

    const agentMutation = useMutation({
        mutationFn: (data: { agentId: string; agentFunction: any }) =>
            manualTriggerForAgent(data.agentId, data.agentFunction),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            // router.push('/agents');
            SuccessToast(`${agentFunction.name} has been successfully triggered.`);
            closeModal();
        },
        onError: () => {
            console.log('Error Response');
            ErrorToast('Error while manually triggering Agent Function. Try Again!');
        }
    });

    const handleTrigger = async () => {
        if (agentFunction.num_parameters && agentFunction.parameters) {
            const { isError, errIndex } = validateInputField(agentFunction.parameters);
            if (isError) {
                setErrorParamIndex(errIndex);
                return;
            }
        }
        const updatedParams = params
            .map((param) => {
                if (param.data_type === 'group') {
                    return param.parameters;
                }
                return param;
            })
            .flat();
        await agentMutation.mutateAsync({
            agentId,
            agentFunction: {
                function_name: agentFunction.function_name,
                parameters: updatedParams
            }
        });
    };

    return (
        <div className={'flex h-full w-full flex-col'}>
            <span className={'px-5 py-2 text-base font-medium'}>Manual Trigger</span>
            <Separator />
            <div className={'flex flex-col gap-2 px-5 py-4'}>
                <span className={'text-lg '}>{agentFunction.name} Function</span>
                <span className={'text-sm text-brand-Black-300/80'}>
                    {agentFunction.description}
                </span>
                <div className={'my-3 flex flex-wrap gap-4'}>
                    {Array.isArray(agentFunction.parameters) &&
                    agentFunction.parameters.length ? (
                        <FunctionParameters
                            key={agentFunction.function_name}
                            parameters={agentFunction.parameters}
                            errorIndex={errorParamIndex}
                        />
                    ) : (
                        <></>
                    )}
                </div>
                <div className={'mt-2 flex justify-end gap-2'}>
                    <Button variant={'destructive'} onClick={() => closeModal()}>
                        Cancel
                    </Button>
                    <Button variant={'primary'} onClick={handleTrigger}>
                        Trigger
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AgentManualTriggerModalView;
