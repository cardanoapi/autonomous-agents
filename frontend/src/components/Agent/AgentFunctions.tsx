import { useState } from 'react';

import { IAgent } from '@api/agents';
import { IAgentConfiguration } from '@api/agents';
import { ITriggerCreateDto } from '@api/trigger';
import { postTrigger } from '@api/trigger';
import { Dialog, DialogContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';
import { mapConfiguredFunctionToTriggerCreateDTO } from '@app/app/(pages)/templates/create-template/components/utils/FunctionUtil';
import { IConfiguredFunctionsItem } from '@app/app/(pages)/templates/create-template/page';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Button } from '../atoms/Button';
import { ErrorToast, SuccessToast } from '../molecules/CustomToasts';
import TextDisplayField from '../molecules/TextDisplayField';
import { ScrollArea } from '../shadcn/ui/scroll-area';
import AgentFunctionForm from './AgentFunctionForm';
import AgentFunctionsDetailComponent from './AgentFunctionsDetail';

export default function AgentFunctionsComponent({
    agent
}: {
    agent: IAgent | null | undefined;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const toggleDialog = () => {
        setDialogOpen(dialogOpen ? false : true);
    };

    const functionMutation = useMutation({
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

    const handlePostTrigger = (item: IConfiguredFunctionsItem) => {
        const triggerData = mapConfiguredFunctionToTriggerCreateDTO(item);
        triggerData && functionMutation.mutate(triggerData);
    };

    return (
        <div className="flex flex-col gap-10 ">
            <div className="flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                    <TextDisplayField
                        title="Agent Name"
                        content={'Saved Functions'}
                        textClassName="text-xl font-semibold"
                    />
                    <Button
                        variant="primary"
                        onClick={toggleDialog}
                        size="sm"
                        className="min-w-32 px-4"
                    >
                        Add Function
                    </Button>
                </div>
                <ScrollArea className="h-[500px] w-full overflow-y-auto px-2 ">
                    <AgentFunctionsDetailComponent
                        agentConfigurations={agent?.agent_configurations || []}
                    />
                </ScrollArea>
            </div>
            <Dialog open={dialogOpen}>
                <DialogContent className="bg- relative bg-brand-Azure-400 !p-0">
                    <FunctionForm
                        onClose={toggleDialog}
                        onValueChange={() => {}}
                        onSave={(item: IConfiguredFunctionsItem) => {
                            handlePostTrigger(item);
                        }}
                        hideFormHeader={true}
                        btnPlaceholder={'Add Function'}
                        renderFunctionSelector={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
