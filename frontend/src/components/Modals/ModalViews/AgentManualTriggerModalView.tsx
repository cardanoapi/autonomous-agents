import React, { useState } from 'react';

import { manualTriggerForAgent } from '@api/agents';
import { IFunction, IParameter } from '@api/functions';
import { useMutation } from '@tanstack/react-query';
import { validateInputFieldForGroup } from '@utils';
import { useAtom } from 'jotai';

import GroupParams from '@app/components/Agent/GroupParameters';
import { Button } from '@app/components/atoms/Button';
import { Input } from '@app/components/atoms/Input';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import { Separator } from '@app/components/shadcn/ui/separator';
import { agentsAtom } from '@app/store/localStore';
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
    const [agents] = useAtom(agentsAtom);

    const [params, setParams] = useState(agentFunction.parameters ?? []);
    const [errorParamIndex, setErrorParamIndex] = useState<Array<number>>([]);

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
            ErrorToast('Error while manually triggering Agent Function. Try Again!');
        }
    });
    const handleTrigger = async () => {
        if (agentFunction.num_parameters) {
            const isError = validateInputField();
            if (isError) {
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

    function validateInputField() {
        let isError = false;
        const errIndex: Array<number> = [];
        params.map((param: IParameter, index: number) => {
            if (param.data_type === 'group') {
                errIndex.push(index);
                isError = !validateInputFieldForGroup(param);
            } else if (!param.optional && !param.value) {
                errIndex.push(index);
                isError = true;
            }
        });
        setErrorParamIndex(errIndex);
        return isError;
    }

    const handleInputChange = (
        value: string,
        index: number,
        isGroupParams: boolean = false,
        groupIndex: number = 0
    ) => {
        const updatedParams = [...params];
        if (isGroupParams && updatedParams.length) {
            const group = updatedParams[groupIndex];
            if (group && group.parameters && group.parameters[index]) {
                group.parameters[index] = {
                    ...group.parameters[index],
                    value
                };
            }
            updatedParams[groupIndex] = group;
        } else {
            updatedParams[index] = { ...updatedParams[index], value };
        }
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
                <span className={'text-lg '}>{agentFunction.name} Function</span>
                <span className={'text-sm text-brand-Black-300/80'}>
                    {agentFunction.description}
                </span>
                <div className={'my-3 flex flex-wrap gap-4'}>
                    {Array.isArray(agentFunction.parameters) &&
                    agentFunction.parameters.length ? (
                        agentFunction.parameters.map(
                            (param: IParameter, index: number) => {
                                return param.data_type !== 'group' ? (
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
                                                handleInputChange(e.target.value, index)
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
                                ) : (
                                    <GroupParams
                                        isError={errorParamIndex.includes(index)}
                                        param={param}
                                        handleOnChange={(
                                            groupParamVal: string,
                                            groupParamIndex: number
                                        ) => {
                                            handleInputChange(
                                                groupParamVal,
                                                groupParamIndex,
                                                true,
                                                index
                                            );
                                        }}
                                    />
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
                    <Button
                        disabled={agents ? !agents[agentId].is_active : false}
                        variant={'primary'}
                        onClick={handleTrigger}
                    >
                        Trigger
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AgentManualTriggerModalView;
