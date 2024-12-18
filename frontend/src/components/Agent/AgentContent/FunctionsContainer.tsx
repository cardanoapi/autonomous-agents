'use client';

import React, { useState } from 'react';

import { IAgent, IAgentConfiguration } from '@api/agents';
import { updateTrigger } from '@api/trigger';
import { Dialog, DialogContent } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMutation } from '@tanstack/react-query';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import {
    mapAgentConfigurationToFormFunction,
    mapFormFunctionToAgentConfiguration
} from '@app/app/(pages)/templates/create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '@app/app/(pages)/templates/create-template/page';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { ErrorToast, SuccessToast } from '../../molecules/CustomToasts';
import FunctionCardWithMeta from '../shared/FunctionCardWithMeta';

const AgentFunctionsDetailComponent = ({
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

    const isMobile = useMediaQuery('(max-width: 600px)');

    return (
        <>
            {agentConfigurations &&
                agentConfigurations.map((config, index) => (
                    <FunctionCardWithMeta
                        config={config}
                        onClickDelete={onClickDelete}
                        enableContol={enableContol}
                        handleClickEdit={handleClickEdit}
                        key={index}
                    />
                ))}
            {currentFunction && (
                <Dialog open={openDialog} maxWidth={'xl'}>
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
        </>
    );
};

export default AgentFunctionsDetailComponent;
