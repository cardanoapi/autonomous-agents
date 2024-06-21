import React, { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { manualTriggerForAgent } from '@app/app/api/agents';
import { IFunction, IParameter } from '@app/app/api/functions';
import { Button } from '@app/components/atoms/Button';
import { Input } from '@app/components/atoms/Input';
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

    const [params, setParams] = useState(agentFunction.parameters ?? []);
    const [errorParamIndex, setErrorParamIndex] = useState<Array<number>>([]);

    const agentMutation = useMutation({
        mutationFn: (data: { agentId: string; agentFunction: any }) =>
            manualTriggerForAgent(data.agentId, data.agentFunction),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            // router.push('/agents');
            SuccessToast(
                `${agentFunction.function_name} has been successfully triggered.`
            );
            closeModal();
        },
        onError: () => {
            console.log('Error Response');
            // setSubmittingForm(false);
            ErrorToast('Error while manually triggering Agent Function. Try Again!');
        }
    });
    const handleTrigger = async () => {
        if (agentFunction.num_parameters) {
            const isError = validateInputField();
            if (isError) return;
        }
        await agentMutation.mutateAsync({
            agentId,
            agentFunction: {
                function_name: agentFunction.function_name,
                parameter: params
            }
        });
    };

    function validateInputField() {
        let isError = false;
        const errIndex: Array<number> = [];
        params.map((param: IParameter, index: number) => {
            if (!param.optional && !param.value) {
                errIndex.push(index);
                isError = true;
            }
        });
        setErrorParamIndex(errIndex);
        return isError;
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        e.preventDefault();
        const updatedParams = [...params];
        updatedParams[index] = { ...updatedParams[index], value: e.target.value };
        setParams(updatedParams);
        const newErrorIndex = errorParamIndex.filter(
            (errIndex: number) => errIndex != index
        );
        setErrorParamIndex(newErrorIndex);
    };

    return (
        <div className={'flex h-full w-full flex-col'}>
            <span className={'px-5 py-2 text-base font-medium'}>Manual Trigger</span>
            <Separator />
            <div className={'flex flex-col gap-2 px-5 py-4'}>
                <span className={'text-lg '}>
                    {agentFunction.function_name} Function
                </span>
                <span className={'text-sm text-brand-Black-300/80'}>
                    {agentFunction.description}
                </span>
                <div className={'my-3 flex flex-wrap gap-4'}>
                    {Array.isArray(agentFunction.parameters) &&
                    agentFunction.parameters.length ? (
                        agentFunction.parameters.map(
                            (param: IParameter, index: number) => {
                                return (
                                    <div key={index} className={'flex flex-col gap-1'}>
                                        <span>
                                            {param.description}{' '}
                                            {param.optional ? (
                                                <></>
                                            ) : (
                                                <span
                                                    className={
                                                        'mt-2 text-lg text-red-500'
                                                    }
                                                >
                                                    *
                                                </span>
                                            )}
                                        </span>
                                        <Input
                                            value={params[index].value}
                                            onChange={(e) =>
                                                handleInputChange(e, index)
                                            }
                                        />
                                        {errorParamIndex.length &&
                                        errorParamIndex.includes(index) ? (
                                            <span className={'text-sm text-red-500'}>
                                                This field is required.
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                );
                            }
                        )
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
