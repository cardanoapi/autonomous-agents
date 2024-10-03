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
import { cn } from '../lib/utils';
import { ScrollArea } from '../shadcn/ui/scroll-area';
import AgentFunctionsDetailComponent from './AgentFunctionsDetail';

const AgentOverViewComponent = ({
    agent,
    enableEdit
}: {
    agent?: IAgent;
    enableEdit?: boolean;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [agentName, setAgentName] = useState(agent?.name || '');
    const [agentInstance, setAgentInstance] = useState(agent?.instance || 0);
    const [agentConfigurations, setAgentConfigurations] = useState<
        Array<IAgentConfiguration>
    >(agent?.agent_configurations || []);

    const agentNameRef = useRef<HTMLInputElement>(null);

    const updateAgent = useMutation({
        mutationFn: (data: IAgentUpdateReqDto) => updateAgentData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`agent${agent?.id}`] });
            queryClient.refetchQueries({ queryKey: ['myAgent'] });
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
        if (configIndex < agentConfigurations.length) {
            agentConfigurations[configIndex] = agentConfig;
        } else {
            agentConfigurations.push(agentConfig);
        }
        setAgentConfigurations([...agentConfigurations]);
    };

    const handleClickUpdate = () => {
        const updatedAgentConfigs = agentConfigurations.map((config) => ({
            id: config.id,
            agent_id: agent?.id || '',
            type: config.type,
            action: config.action,
            data: config.data
        }));
        console.log(updatedAgentConfigs);
        // updateAgent
        //     .mutateAsync({
        //         agentId: agent?.id,
        //         agentName: agentName,
        //         instance: agentInstance,
        //         agentConfigurations: updatedAgentConfigs
        //     })
        //     .then(() => {
        //         setIsEditing(false);
        //     });
    };

    const handleClickDeleteAgent = (configIndex: number) => {
        if (agent) {
            const updatedConfigs = agentConfigurations?.filter(
                (_, index) => index != configIndex
            );
            updatedConfigs && setAgentConfigurations(updatedConfigs);
        }
    };

    const renderWalletDetail = () => {
        return (
            <div className={' flex flex-col gap-2'}>
                <div className={'flex flex-col'}>
                    <span className={'pb-2 text-lg font-medium'}>Wallet</span>
                    <div className={'flex w-full items-center gap-1'}>
                        <span className={' font-medium'}>Address :</span>
                        <TextDisplayField
                            title="Address"
                            content={agent?.agent_address}
                            showCopy
                        />
                    </div>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>Balance :</span>
                        <span>{agent?.wallet_amount + ' Ada'} </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderDrepDetail = () => {
        return (
            <div className={'flex flex-col items-end gap-2'}>
                <div className={'flex flex-col'}>
                    <span className={'pb-2 text-start text-lg font-medium'}>DRep</span>
                    <div className={'flex w-full items-center gap-1'}>
                        <span className={'font-medium'}>Id :</span>
                        <TextDisplayField
                            title="Id"
                            showCopy
                            content={agent?.drep_id}
                        />
                    </div>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>Registered :</span>
                        <span>{agent?.is_drep_registered ? 'Yes' : 'No'}</span>
                    </div>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>Voting Power :</span>
                        <span>{agent?.voting_power ? agent?.voting_power : 0}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderDelegationDetail = () => {
        return (
            <div className={'flex flex-col gap-2'}>
                <div className={'flex flex-col'}>
                    <span className={'pb-2 text-start text-lg font-medium'}>
                        Delegation
                    </span>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>DRep :</span>
                        <span>
                            {' '}
                            {agent?.delegation?.drep_id
                                ? agent?.delegation?.drep_id
                                : '___'}{' '}
                        </span>
                    </div>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>Pool :</span>
                        <span>
                            {agent?.delegation?.pool_id
                                ? agent?.delegation?.pool_id
                                : '___'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderStakeDetail = () => {
        return (
            <div className={' flex flex-col items-end gap-2'}>
                <div className={'flex flex-col'}>
                    <span className={'pb-2 text-lg font-medium'}>Stake</span>
                    <div className={'flex w-full items-center gap-1'}>
                        <span className={'font-medium'}>Address:</span>
                        <TextDisplayField
                            title="Address"
                            showCopy
                            content={agent?.drep_id}
                        />
                    </div>
                    <div className={'flex gap-2'}>
                        <span className={' font-medium'}>Registered :</span>
                        <span>{agent?.is_stake_registered ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        );
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
                        className={cn('cursor-pointer', enableEdit ? '' : '!hidden')}
                        onClick={handleClickEditButton}
                    />
                )}
            </div>
            <ScrollArea
                className={'h-agentComponentHeight w-full overflow-y-auto pr-6 '}
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
                        <div className={'flex flex-col gap-2'}>
                            <h1 className={'text-sm font-medium'}>Agent Instance</h1>
                            <input
                                type={'number'}
                                value={agentInstance}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setAgentInstance(+e.target.value)
                                }
                                className={
                                    's w-fit rounded border-0 border-b border-gray-300 px-4 py-2 outline-0'
                                }
                            />
                        </div>
                        <div className={'flex justify-start'}>
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
                        <TextDisplayField
                            title={'Number of Agents'}
                            content={agent?.instance}
                        />
                        <div className="grid w-full grid-cols-2 justify-between gap-y-10">
                            <div className="flex w-full items-start">
                                {renderWalletDetail()}
                            </div>
                            <div className="flex w-full items-center">
                                {renderDrepDetail()}
                            </div>
                            <div className="flex w-full items-start">
                                {renderDelegationDetail()}
                            </div>
                            <div className="flex w-full items-center">
                                {renderStakeDetail()}
                            </div>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default AgentOverViewComponent;
