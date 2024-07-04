'use client';

import React, { useState } from 'react';

import { Edit, Trash2 } from 'lucide-react';

import { IAgentConfiguration, ICronTrigger } from '@app/app/api/agents';
import UpdateAgentFunctionModal from '@app/components/molecules/UpdateAgentFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';

const AgentFunctionsDetailComponent = ({
    onClickSave,
    onClickDelete,
    agentConfigurations,
    isEditing = false
}: {
    agentConfigurations?: Array<IAgentConfiguration>;
    isEditing?: boolean;
    onClickSave?: (...args: any) => void;
    onClickDelete?: (configIndex: number) => void;
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [agentConfigIndex, setAgentConfigIndex] = useState(0);
    return (
        <div className={'flex flex-col gap-2'}>
            <h1 className={'text-sm font-medium'}>Agent Functions</h1>
            <div className={'flex flex-row flex-wrap gap-4 '}>
                {!agentConfigurations?.length ? (
                    <span className={'text-xs text-brand-Black-300'}>
                        No Agents Function Found
                    </span>
                ) : (
                    agentConfigurations?.map((config, index: number) => {
                        return (
                            <div
                                className={
                                    'group relative flex w-[300px] flex-col flex-wrap gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md'
                                }
                                key={`${config.agentId}-${config.id}`}
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
                                    <div className={'to-2 absolute right-2 flex gap-1'}>
                                        {config.type === 'CRON' && (
                                            <Edit
                                                color="#A1A1A1"
                                                className={
                                                    'hidden h-4 w-4 cursor-pointer group-hover:block'
                                                }
                                                onClick={() => {
                                                    setAgentConfigIndex(index);
                                                    setOpenDialog(true);
                                                }}
                                            />
                                        )}

                                        <Trash2
                                            color="#A1A1A1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClickDelete && onClickDelete(index);
                                            }}
                                            className="hidden h-4  w-4 hover:cursor-pointer  group-hover:block"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent
                    className={'!min-w-[650px] !p-0'}
                    onClickCloseIcon={() => setOpenDialog(false)}
                >
                    <UpdateAgentFunctionModal
                        agentConfigIndex={agentConfigIndex}
                        agentConfigs={agentConfigurations}
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
