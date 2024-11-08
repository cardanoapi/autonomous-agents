'use client';

import React, { useState } from 'react';

import { IAgentConfiguration } from '@api/agents';
import { IAgent } from '@api/agents';
import { updateTrigger } from '@api/trigger';
import { Dialog, DialogContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { OctagonAlert } from 'lucide-react';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import {
    mapAgentConfigurationToFormFunction,
    mapFormFunctionToAgentConfiguration
} from '@app/app/(pages)/templates/create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '@app/app/(pages)/templates/create-template/page';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { SuccessToast, ErrorToast } from '@app/components/molecules/CustomToasts';
import FunctionCardWithMeta from '@app/components/organisms/agent/FunctionCardWithMeta';
import ErrorPlaceholder from '@app/components/molecules/ErrorPlaceholder';

const AgentFunctionsList = ({
    agent,
    onClickDelete,
    agentConfigurations,
    enableContol = false
}: {
    agentConfigurations?: Array<IAgentConfiguration>;
    onClickDelete?: (configIndex: string) => void;
    enableContol?: boolean;
    agent?: IAgent;
}) => {
    const [openDialog, setOpenDialog] = useState(false);

    const [currentFunction, setCurrentFunction] =
        useState<IFormFunctionInstance | null>(null);

    const updateTemplate = useMutation({
        mutationFn: (data: IAgentConfiguration) => updateTrigger(data),
        onSuccess: () => {
            SuccessToast('Function Updated Successfully.');
        },
        onError: (error: any) => {
            ErrorToast(error?.response?.data);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [`agent${agent?.id}`] });
            setOpenDialog(false);
        }
    });

    const handleClickEdit = (config: any) => {
        const mappedFunction = mapAgentConfigurationToFormFunction(config);
        setCurrentFunction(mappedFunction);
        setOpenDialog(true);
    };

    const handleUpdate = (functionData: IFormFunctionInstance) => {
        console.log(functionData);

        if (functionData.agent_id) {
            const data = mapFormFunctionToAgentConfiguration(functionData);
            updateTemplate.mutateAsync(data);
        }
    };

    return (
        <div className="flex h-full flex-col gap-2">
            <div className="flex items-center gap-4"></div>
            <div className="flex flex-row flex-wrap gap-6">
                {!agentConfigurations?.length ? (
                    <ErrorPlaceholder
                        title="No Functions"
                        content="Agent seems to have no functions configured."
                        icon={OctagonAlert}
                        className="absolute h-full w-full border-0"
                    />
                ) : (
                    agentConfigurations.map((config, index) => (
                        <FunctionCardWithMeta
                            config={config}
                            onClickDelete={onClickDelete}
                            enableContol={enableContol}
                            handleClickEdit={handleClickEdit}
                            key={index}
                        />
                    ))
                )}
            </div>
            {currentFunction && (
                <Dialog open={openDialog}>
                    <DialogContent className="!p-0">
                        <FunctionForm
                            currentFunction={currentFunction}
                            onValueChange={() => {}}
                            onSave={(functionData) => {
                                handleUpdate(functionData);
                            }}
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

export default AgentFunctionsList;
