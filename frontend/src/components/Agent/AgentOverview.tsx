'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { Edit } from 'lucide-react';

import {
    IAgent,
    IAgentConfiguration,
    IAgentUpdateReqDto,
    updateAgentData
} from '@app/app/api/agents';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import TextDisplayField from '@app/components/molecules/TextDisplayField';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Button } from '../atoms/Button';
import { ScrollArea } from '../shadcn/ui/scroll-area';
import AgentFunctionsDetailComponent from './AgentFunctionsDetail';

const AgentOverViewComponent = ({ agent }: { agent?: IAgent }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [agentName, setAgentName] = useState(agent?.name || '');
    const [agentConfigurations, setAgentConfigurations] = useState<
        Array<IAgentConfiguration>
    >(agent?.agent_configurations || []);

    const agentNameRef = useRef<HTMLInputElement>(null);

    const updateAgent = useMutation({
        mutationFn: (data: IAgentUpdateReqDto) => updateAgentData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`agent${agent?.id}`] });
            SuccessToast('Agent successfully updated.');
        },
        onError: (error: any) => {
            ErrorToast(error?.response?.data);
        }
    });

    useEffect(() => {
        if (isEditing && agentNameRef.current) {
            agentNameRef.current.focus();
        }
    }, [isEditing]);
    const handleClickEditButton = () => {
        setIsEditing(true);
    };

    const handleUpdateAgentFunction = (
        agentConfig: IAgentConfiguration,
        configIndex: number
    ) => {
        if (agent) {
            const updatedConfigs = agent.agent_configurations?.map((config, index) => {
                if (configIndex === index) return agentConfig;
                else return config;
            });
            updatedConfigs && setAgentConfigurations(updatedConfigs);
        }
    };

    const handleClickUpdate = () => {
        updateAgent
            .mutateAsync({
                agentId: agent?.id,
                agentName: agentName,
                agentConfigurations: agentConfigurations
            })
            .then((res) => {
                setIsEditing(false);
                console.log(res);
            });
    };

    const handleClickDeleteAgent = (configIndex: number) => {
        if (agent) {
            const updatedConfigs = agentConfigurations?.filter(
                (_, index) => index != configIndex
            );
            updatedConfigs && setAgentConfigurations(updatedConfigs);
        }
    };

    return (
        <div className={'flex h-full flex-col gap-10 '}>
            <div className={'flex justify-between'}>
                <div className={'flex items-center gap-3'}>
                    <AgentsIcon />
                    <span className={'text-[20px] font-semibold'}>Agent Overview</span>
                </div>
                {isEditing ? (
                    <></>
                ) : (
                    <Edit
                        className={'cursor-pointer'}
                        onClick={handleClickEditButton}
                    />
                )}
            </div>
            <ScrollArea
                className={'h-agentComponentHeight w-full overflow-y-auto pr-4 '}
            >
                {isEditing ? (
                    <div className={'flex flex-col gap-10'}>
                        <div className={'flex flex-col gap-2'}>
                            <h1 className={'text-sm font-medium'}>Agent Name</h1>
                            <input
                                ref={agentNameRef}
                                type={'text'}
                                value={agentName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setAgentName(e.target.value)
                                }
                                className={
                                    's w-fit rounded border-0 border-b border-gray-300 px-4 py-2 outline-0'
                                }
                            />
                        </div>
                        <AgentFunctionsDetailComponent
                            onClickSave={(agentConfig, index) => {
                                handleUpdateAgentFunction(agentConfig, index);
                            }}
                            onClickDelete={(configIndex: number) =>
                                handleClickDeleteAgent(configIndex)
                            }
                            agentConfigurations={agentConfigurations}
                            isEditing={true}
                        />
                        <div className={'flex justify-end'}>
                            <Button
                                onClick={() => handleClickUpdate()}
                                variant={'primary'}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={'flex flex-col gap-10'}>
                        <TextDisplayField title={'Agent Name'} content={agent?.name} />
                        <AgentFunctionsDetailComponent
                            agentConfigurations={agentConfigurations}
                        />
                        <div className={'flex justify-between'}>
                            <div className={'flex w-full items-center gap-1'}>
                                <TextDisplayField
                                    title={'Wallet Address'}
                                    content={agent?.agent_address}
                                    showCopy
                                />
                            </div>
                            <TextDisplayField
                                title={'Wallet Balance'}
                                content={agent?.wallet_amount + ' Ada'}
                            />
                        </div>
                        <TextDisplayField
                            title={'Number of Agents'}
                            content={agent?.instance}
                        />
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default AgentOverViewComponent;
