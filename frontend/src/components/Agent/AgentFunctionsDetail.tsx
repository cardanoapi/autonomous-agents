'use client';

import React, { useState } from 'react';

import { IAgentConfiguration, ICronTrigger } from '@api/agents';
import { ITriggerCreateDto, updateTrigger } from '@api/trigger';
import { TemplateFunctions } from '@models/types/functions';
import { Dialog, DialogContent } from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import { mapAgentConfigurationToFormFunction, mapFormFunctionToAgentConfiguration, mapFormFunctionToTriggerConfiguration } from '@app/app/(pages)/templates/create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '@app/app/(pages)/templates/create-template/page';
import { convertCRONExpressionToReadableForm } from '@app/utils/dateAndTimeUtils';
import { SuccessToast } from '../molecules/CustomToasts';
import { useMutation } from '@tanstack/react-query';
import { ErrorToast } from '../molecules/CustomToasts';

import CustomCopyBox from './CustomCopyBox';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

const AgentFunctionsDetailComponent = ({
    onClickSave,
    onClickDelete,
    agentConfigurations,
    isEditing = false
}: {
    agentConfigurations?: Array<IAgentConfiguration>;
    isEditing?: boolean;
    onClickSave?: (agentConfig: IAgentConfiguration, index: number) => void;
    onClickDelete?: (configIndex: string) => void;
}) => {
    const [openDialog, setOpenDialog] = useState(false);

    const [currentFunction, setCurrentFunction] =
        useState<IFormFunctionInstance | null>(null);

    const getFunctionMetaData = (functionName: string) => {
        return TemplateFunctions.find((f) => f.id === functionName);
    };

    const handleOpenDialog = (isAddNew: boolean, index?: number) => {
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

    const updateTemplate = useMutation({
        mutationFn: (data: IAgentConfiguration) => updateTrigger(data),
        onSuccess: () => {
            SuccessToast('Function Updated Successfully.');
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            queryClient.invalidateQueries({ queryKey: ['myAgent'] });
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setOpenDialog(false);
        },
        onError: (error: any) => {
            ErrorToast(error?.response?.data);
        }
    });

    const handleClickEdit = (config: IAgentConfiguration) => {
        const mappedFunction =  mapAgentConfigurationToFormFunction(config)
        setCurrentFunction(mappedFunction)
        setOpenDialog(true)
    };

    const handleUpdate = (functionData : IFormFunctionInstance) => {

        console.log(functionData)

        if (functionData.agent_id) {
            const data = mapFormFunctionToAgentConfiguration(functionData)
            updateTemplate.mutateAsync(data)
        }
    }

    return (
        <div className="flex h-full flex-col gap-2">
            <div className="flex items-center gap-4"></div>
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
                            <div className="absolute right-3 top-3 hidden items-center gap-2 group-hover:flex">
                                <Edit
                                    className="cursor-pointer text-gray-400"
                                    size={20}
                                    onClick={() => handleClickEdit(config)}
                                />
                                <Trash2
                                    className="cursor-pointer text-red-400 group-hover:flex"
                                    size={20}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickDelete && onClickDelete(config.id);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                {renderConfigMeta(config)}
                            </div>
                            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4 px-1">
                                <CustomCopyBox
                                    title="Trigger Probability"
                                    content={`${(config.data as ICronTrigger).probability * 100 || 100}%`}
                                    className="w-auto"
                                    showCopyIcon={false}
                                />
                                {
                                    config.type === 'CRON' &&
                                        <CustomCopyBox
                                            title="Cron Expression"
                                            content={convertCRONExpressionToReadableForm(
                                                (config.data as ICronTrigger).frequency
                                            )}
                                            className="w-auto"
                                            showCopyIcon={false}
                                        />
                                }
                                {config.action?.parameters.map((param, index) =>
                                    typeof param.value === 'object' &&
                                    !Array.isArray(param.value) &&
                                    param.value !== null &&
                                    param.value !== undefined ? (
                                        Object.entries(param.value).map(
                                            ([key, value], subIndex) => (
                                                <CustomCopyBox
                                                    title={key}
                                                    content={value?.toString() || ''}
                                                    key={subIndex}
                                                    className="w-auto"
                                                    iconClassName="text-gray-500"
                                                    showCopyIcon={false}
                                                    copyOnContentClick={true}
                                                />
                                            )
                                        )
                                    ) : (
                                        <CustomCopyBox
                                            title={param.name}
                                            content={param.value?.toString() || ''}
                                            key={index}
                                            className="w-auto"
                                            iconClassName="text-gray-500"
                                            showCopyIcon={false}
                                            copyOnContentClick={true}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {currentFunction && (
                <Dialog open={openDialog}>
                    <DialogContent className="!min-w-[650px] !p-0">
                        <FunctionForm
                            currentFunction={currentFunction}
                            onValueChange={() => {}}
                            onSave={(functionData) => {handleUpdate(functionData)}}
                            onClose={() => setOpenDialog(false)}
                            editMode={true}
                            btnPlaceholder="Update"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AgentFunctionsDetailComponent;
