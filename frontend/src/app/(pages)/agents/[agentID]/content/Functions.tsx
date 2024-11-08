import { useState } from 'react';

import { IAgent } from '@api/agents';
import { ITriggerCreateDto, deleteTrigger } from '@api/trigger';
import { postTrigger } from '@api/trigger';
import { Dialog, DialogContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import { mapFormFunctionToTriggerConfiguration } from '@app/app/(pages)/templates/create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '@app/app/(pages)/templates/create-template/page';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Button } from '@app/components/atoms/Button';
import ConfirmationBox from '@app/components/molecules/ConfirmationBox';
import { ErrorToast , SuccessToast } from '@app/components/molecules/CustomToasts';
import TextDisplayField from '@app/components/molecules/TextDisplayField';
import HeaderContent from './ContentHeader';
import AgentFunctionsDetailComponent from './FunctionsContainer';

export default function AgentFunctionsComponent({
    agent,
    enableControl
}: {
    agent: IAgent | null | undefined;
    enableControl?: boolean;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
    const [triggerID, setTriggerID] = useState('');

    const toggleDialog = () => {
        setDialogOpen(dialogOpen ? false : true);
    };

    const postTriggerMutation = useMutation({
        mutationFn: (data: ITriggerCreateDto) => postTrigger(agent?.id || '', data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`agent${agent?.id}`] });
            toggleDialog();
            SuccessToast('Function Added Successfully');
        },
        onError: () => {
            ErrorToast('Something went wrong!');
        }
    });

    const deleteTriggerMutation = useMutation({
        mutationFn: (triggerID: string) => deleteTrigger(triggerID),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`agent${agent?.id}`] });
            SuccessToast('Function Deleted Successfully');
        },
        onError: () => {
            ErrorToast('Something went wrong!');
        }
    });

    const handlePostTrigger = (item: IFormFunctionInstance) => {
        const triggerData = mapFormFunctionToTriggerConfiguration(item);
        triggerData && postTriggerMutation.mutate(triggerData);
    };

    const handleDeleteTrigger = (triggerID: string) => {
        setOpenDeleteConfirmation(true);
        setTriggerID(triggerID);
    };

    const handleDeleteConfirmation = () => {
        deleteTriggerMutation.mutate(triggerID);
        setOpenDeleteConfirmation(false);
    };

    return (
        <div className="flex flex-col gap-10 ">
            <div className="flex flex-col gap-4">
                <HeaderContent>
                    <div className="flex w-full items-center justify-between bg-white">
                        <TextDisplayField
                            title="Agent Name"
                            content={'Saved Functions'}
                            textClassName="text-xl font-semibold"
                        />
                        {enableControl && (
                            <Button
                                variant="primary"
                                onClick={toggleDialog}
                                size="sm"
                                className="min-w-32 px-4"
                            >
                                Add Function
                            </Button>
                        )}
                    </div>
                </HeaderContent>
                <AgentFunctionsDetailComponent
                    agentConfigurations={agent?.agent_configurations || []}
                    onClickDelete={handleDeleteTrigger}
                    enableContol={enableControl}
                    agent={agent || undefined}
                />
            </div>
            <Dialog open={dialogOpen}>
                <DialogContent className="relative bg-brand-Azure-400 !p-0">
                    <FunctionForm
                        onClose={toggleDialog}
                        onValueChange={() => {}}
                        onSave={(item: IFormFunctionInstance) => {
                            handlePostTrigger(item);
                        }}
                        btnPlaceholder={'Add Function'}
                        renderFunctionSelector={true}
                    />
                </DialogContent>
            </Dialog>
            <Dialog
                open={openDeleteConfirmation}
                onClose={() => setOpenDeleteConfirmation(false)}
            >
                <DialogContent>
                    <ConfirmationBox
                        msg="Are you sure you want to delete this function? This action cannot be undone! "
                        title="Confirm Delete"
                        onAccept={handleDeleteConfirmation}
                        onClose={() => setOpenDeleteConfirmation(false)}
                        onDecline={() => setOpenDeleteConfirmation(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
