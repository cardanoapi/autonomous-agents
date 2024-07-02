'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Edit, Save } from 'lucide-react';

import UpdateAgentFunctionModal from '@app/app/(pages)/agents/[agentID]/Components/UpdateAgentFunctionModal';
import { IAgent, IAgentConfiguration, ICronTrigger } from '@app/app/api/agents';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import TextDisplayField from '@app/components/molecules/TextDisplayField';

import { Dialog, DialogContent } from '../shadcn/dialog';
import { ScrollArea } from '../shadcn/ui/scroll-area';

const AgentOverViewComponent = ({ agent }: { agent?: IAgent }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [agentName, setAgentName] = useState(agent?.name || '');
    const agentNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && agentNameRef.current) {
            agentNameRef.current.focus();
        }
    }, [isEditing]);
    const handleClickEditButton = () => {
        setIsEditing(true);
    };

    const handleUpdateAgentConfiguration = (
        agentConfig: IAgentConfiguration,
        configIndex: number
    ) => {
        if (agent) {
            const a = agent.agent_configurations?.map((config, index) => {
                if (configIndex === index) return agentConfig;
                else return config;
            });
            console.log('new updated config is : ', a);
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
                    <Save
                        className={'cursor-point'}
                        onClick={() => setIsEditing(false)}
                    />
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
                        <AgentFunctionsComponent
                            onClickSave={(agentConfig, index) => {
                                handleUpdateAgentConfiguration(agentConfig, index);
                            }}
                            agent={agent}
                            isEditing={true}
                        />
                    </div>
                ) : (
                    <div className={'flex flex-col gap-10'}>
                        <TextDisplayField title={'Agent Name'} content={agent?.name} />
                        <AgentFunctionsComponent agent={agent} />
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

const AgentFunctionsComponent = ({
    onClickSave,
    agent,
    isEditing = false
}: {
    agent?: IAgent;
    isEditing?: boolean;
    onClickSave?: (...args: any) => void;
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [agentConfigIndex, setAgentConfigIndex] = useState(0);
    return (
        <div className={'flex flex-col gap-2'}>
            <h1 className={'text-sm font-medium'}>Agent Functions</h1>
            <div className={'flex flex-row flex-wrap gap-4 '}>
                {agent?.agent_configurations?.map((config, index: number) => {
                    return (
                        <div
                            className={
                                'group relative flex w-[280px] flex-col flex-wrap gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md'
                            }
                            key={config.agentId}
                        >
                            <span className={'text-sm text-gray-700'}>
                                Name : {config?.action?.function_name}
                            </span>
                            <span className={'text-sm text-gray-700'}>
                                Type : {config.type}
                            </span>
                            <span className={'text-sm text-gray-700'}>
                                Probability :{' '}
                                {(config.data as ICronTrigger).probability
                                    ? (config.data as ICronTrigger).probability
                                    : 1}
                            </span>
                            {isEditing && (
                                <Edit
                                    color="#A1A1A1"
                                    className={
                                        'absolute right-1 top-1 hidden cursor-pointer group-hover:block'
                                    }
                                    onClick={() => {
                                        setAgentConfigIndex(index);
                                        setOpenDialog(true);
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent
                    className={'!min-w-[650px] !p-0'}
                    onClickCloseIcon={() => setOpenDialog(false)}
                >
                    <UpdateAgentFunctionModal
                        agentConfigIndex={agentConfigIndex}
                        agentConfigs={agent?.agent_configurations}
                        onClickSave={(agentConfig, index) => {
                            onClickSave && onClickSave(agentConfig, index);
                            setOpenDialog(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AgentOverViewComponent;
