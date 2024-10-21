import { useState } from 'react';

import { IAgent, IAgentUpdateReqDto, updateAgentData } from '@api/agents';
import { useMutation } from '@tanstack/react-query';
import { Edit } from 'lucide-react';

import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Textarea } from '../../atoms/Textarea';
import { Label } from '../../atoms/label';
import { ErrorToast, SuccessToast } from '../../molecules/CustomToasts';
import { NumberInput } from '../../molecules/NumberInput';
import ContentHeader from './ContentHeader';

export default function AgentSettingsComponent({
    agent,
    enableControl
}: {
    agent: IAgent | undefined;
    enableControl? : boolean
}) {
    const [isEditing, setIsEditing] = useState(false);

    const [agentData, setAgentData] = useState<IAgentUpdateReqDto>({
        agentId: agent?.id,
        agentName: agent?.name,
        instance: agent?.instance,
        templateId: agent?.template_id,
        agentConfigurations: agent?.agent_configurations
    });

    const { mutate: postAgentData, isPending: submittingForm } = useMutation({
        mutationFn: (data: IAgentUpdateReqDto) => updateAgentData(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            queryClient.refetchQueries({ queryKey: ['myAgent'] });
            queryClient.refetchQueries({ queryKey: [`agents${agent?.id || ''}`] });
            SuccessToast('Agent Updated Successfully.');
        },
        onError: () => {
            ErrorToast('Error while updating Agent. Try Again!');
        }
    });

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const validateData = () => {
        if (agentData.agentName?.length === 0) {
            ErrorToast('Agent Name is required');
            return false;
        } else if (agentData.instance === undefined || agentData.instance < 1) {
            ErrorToast('Instance is required');
            return false;
        }
        return true;
    };

    const handleAgentUpdate = () => {
        if (validateData()) {
            postAgentData(agentData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (agent) {
            setAgentData({
                agentId: agent?.id,
                agentName: agent?.name,
                instance: agent?.instance,
                templateId: agent?.template_id,
                agentConfigurations: agent?.agent_configurations
            });
        }
        setIsEditing(false);
    };

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="flex w-[60%] flex-col gap-4 ">
                <ContentHeader>
                <div className="flex items-center gap-2">
                    <span className="h1">Saved Settings</span>
                    {isEditing && <Edit className="text-gray-300" size={20} />}
                </div>
                </ContentHeader>
                <div></div>
                <div className="flex flex-col gap-2">
                    <Label>Agent Name</Label>
                    <Input
                        value={agentData.agentName}
                        className="mx-[2px]"
                        viewOnly={!isEditing}
                        onChange={(e: any) =>
                            setAgentData({ ...agentData, agentName: e.target.value })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Agent Instance</Label>
                    <NumberInput
                        value={agentData.instance}
                        className="mx-[2px]"
                        viewOnly={!isEditing}
                        onChange={(e: any) =>
                            setAgentData({ ...agentData, instance: e.target.value })
                        }
                        min={1}
                    />
                </div>
            </div>
            {
                enableControl && (
            <div className="flex justify-end">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            className="min-w-32"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={'primary'}
                            size={'sm'}
                            className="min-w-32"
                            onClick={handleAgentUpdate}
                        >
                            Save
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant={'primary'}
                        size={'sm'}
                        className="min-w-32"
                        onClick={toggleEdit}
                    >
                        Edit
                    </Button>
                )}
            </div>)
            }
        </div>
    );
}
