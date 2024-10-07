'use client';

import React, { useState } from 'react';

import { IAgentConfiguration, ICronTrigger } from '@api/agents';
import { TemplateFunctions } from '@models/types/functions';
import { Edit, Plus, Trash2 } from 'lucide-react';

import UpdateAgentFunctionModal from '@app/components/molecules/UpdateAgentFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { convertCRONExpressionToReadableForm } from '@app/utils/dateAndTimeUtils';

import CustomCopyBox from './CustomCopyBox';

const AgentFunctionsDetailComponent = ({
    onClickSave,
    onClickDelete,
    agentConfigurations,
    isEditing = false
}: {
    agentConfigurations?: Array<IAgentConfiguration>;
    isEditing?: boolean;
    onClickSave?: (agentConfig: IAgentConfiguration, index: number) => void;
    onClickDelete?: (configIndex: number) => void;
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [addNewConfigBtnClicked, setAddNewConfigBtnClicked] = useState(false);
    const [agentConfigIndex, setAgentConfigIndex] = useState(0);

    const getFunctionMetaData = (functionName: string) => {
        return TemplateFunctions.find((f) => f.id === functionName);
    };

    const handleOpenDialog = (isAddNew: boolean, index?: number) => {
        setAddNewConfigBtnClicked(isAddNew);
        if (index !== undefined) setAgentConfigIndex(index);
        setOpenDialog(true);
    };

    const renderConfigMeta = (config: IAgentConfiguration) => {
        const functionMetaData = getFunctionMetaData(
            config.action?.function_name || ''
        );
        return (
            <>
                <span className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-700">
                    {functionMetaData?.name || config.action?.function_name}{' '}
                    <span className="w-fit rounded-xl bg-blue-100 px-2 py-[1px] text-[10px] font-semibold">
                        {config.type}
                    </span>
                </span>
                <span className="text-[10px] text-gray-700">
                    {functionMetaData?.description || 'No description'}
                </span>
            </>
        );
    };

    const renderConfigDetails = (config: IAgentConfiguration) => {
        const cronTrigger = config.data as ICronTrigger;
        return (
            <div className="flex justify-between">
                <span className="text-xs text-gray-700">
                    Trigger Probability :{' '}
                    {cronTrigger.probability ? cronTrigger.probability * 100 : 100}%
                </span>
                {config.type === 'CRON' && (
                    <span className="text-xs text-gray-700">
                        CRON Expression :{' '}
                        {cronTrigger?.frequency
                            ? convertCRONExpressionToReadableForm(cronTrigger.frequency)
                            : ''}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                {isEditing && (
                    <div
                        className="cursor-pointer rounded p-1 hover:bg-gray-200"
                        onClick={() => handleOpenDialog(true)}
                    >
                        <Plus />
                    </div>
                )}
            </div>
            <div className="flex flex-row flex-wrap gap-6">
                {!agentConfigurations?.length ? (
                    <span className="text-xs text-brand-Black-300">
                        Click edit button to add functions
                    </span>
                ) : (
                    agentConfigurations.map((config, index) => (
                        <div
                            className="group relative flex w-[300px] flex-col flex-wrap justify-between gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md"
                            key={`${config.agent_id}-${config.id}`}
                        >
                            <div className="flex flex-col">
                                {renderConfigMeta(config)}
                            </div>
                            <div className="flex flex-col gap-1">
                                {/* {renderConfigDetails(config)} */}
                                {isEditing && (
                                    <div className="absolute right-2 flex gap-1">
                                        <Edit
                                            color="#A1A1A1"
                                            className="hidden h-4 w-4 cursor-pointer group-hover:block"
                                            onClick={() =>
                                                handleOpenDialog(false, index)
                                            }
                                        />
                                        <Trash2
                                            color="#A1A1A1"
                                            className="hidden h-4 w-4 cursor-pointer group-hover:block"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClickDelete && onClickDelete(index);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4 px-1">
                                <CustomCopyBox
                                    title="Trigger Probability"
                                    content={`${(config.data as ICronTrigger).probability * 100 || 100}%`}
                                    className="w-auto"
                                    showCopyIcon={false}
                                />
                                <CustomCopyBox
                                    title="Cron Expression"
                                    content={convertCRONExpressionToReadableForm(
                                        (config.data as ICronTrigger).frequency
                                    )}
                                    className="w-auto"
                                    showCopyIcon={false}
                                />
                                {config.action?.parameters.map((param, index) => (
                                    <CustomCopyBox
                                        title={param.name}
                                        content={param.value.toString()}
                                        key={index}
                                        className="w-auto"
                                        iconClassName="text-gray-500"
                                        showCopyIcon={false}
                                        copyOnContentClick={true}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="!min-w-[650px] !p-0">
                    <UpdateAgentFunctionModal
                        header={
                            addNewConfigBtnClicked
                                ? 'Add New Agent Configuration'
                                : 'Update Agent Configuration'
                        }
                        agentConfigIndex={
                            addNewConfigBtnClicked
                                ? agentConfigurations?.length || 0
                                : agentConfigIndex
                        }
                        agentConfigs={addNewConfigBtnClicked ? [] : agentConfigurations}
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
