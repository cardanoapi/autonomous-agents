'use client';

import React, { useState } from 'react';

import { Edit } from 'lucide-react';

import UpdateAgentFunctionModal from '@app/app/(pages)/agents/[agentID]/Components/UpdateAgentFunctionModal';
import { IAgent, ICronTrigger } from '@app/app/api/agents';

import { Dialog, DialogContent } from '../shadcn/dialog';

const AgentFunctionsDetailComponent = ({
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

export default AgentFunctionsDetailComponent;
