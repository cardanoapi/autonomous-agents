import { useState } from 'react';

import { IAgent, IAgentUpdateReqDto, updateAgentData } from '@api/agents';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Edit } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

import { currentAgentNameAtom } from '@app/store/localStore';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/label';
import { ErrorToast, SuccessToast } from '../../molecules/CustomToasts';
import { NumberInput } from '../../molecules/NumberInput';
import ContentHeader from './ContentHeader';

export default function AgentSettingsComponent({
    agent,
    enableControl
}: {
    agent: IAgent | undefined;
    enableControl?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [, setAgentName] = useAtom(currentAgentNameAtom);
    const [showSecret, setShowSecret] = useState(false);

    const [agentData, setAgentData] = useState<IAgentUpdateReqDto>({
        agentId: agent?.id,
        agentName: agent?.name,
        instance: agent?.instance,
        templateId: agent?.template_id,
        agentConfigurations: agent?.agent_configurations
    });

    const { mutate: postAgentData } = useMutation({
        mutationFn: (data: IAgentUpdateReqDto) => updateAgentData(data),
        onSuccess: () => {
            SuccessToast('Agent Updated Successfully.');
        },
        onError: () => {
            ErrorToast('Error while updating Agent. Try Again!');
        },
        onSettled: () => {
            setAgentName(agent?.name || 'AgentProfile');
            queryClient.invalidateQueries({
                queryKey: [`agent${agent?.id}`, 'agents']
            });
            setIsEditing(false);
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

    const AgnetDataCanBeChanged = () => {
        return (
            agent &&
            agentData.agentName === agent?.name &&
            agentData.instance === agent?.instance
        );
    };

    return (
        <>
            <div className="flex w-full md:w-[60%] flex-col ">
                <ContentHeader>
                    <div className="flex items-center gap-2">
                        <span className="h1">Saved Settings</span>
                        {isEditing && <Edit className="text-gray-300" size={20} />}
                    </div>
                </ContentHeader>
                <div className="flex flex-col gap-2 ">
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
                <div className="flex flex-col gap-2 mt-4">
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
                <div className="flex flex-col gap-2 mt-4">
                    <Label>Secret Key</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            value={
                                showSecret
                                    ? agent?.secret_key || ''
                                    : '*'.repeat(agent?.secret_key?.length || 10)
                            }
                            className="mx-[2px]"
                            viewOnly={true}
                        />
                        {showSecret ? (
                            <EyeOff
                                onClick={() => setShowSecret(!showSecret)}
                                className="cursor-pointer text-gray-400"
                            />
                        ) : (
                            <Eye
                                onClick={() => setShowSecret(!showSecret)}
                                className="cursor-pointer text-gray-400"
                            />
                        )}
                    </div>
                </div>
            </div>
            {enableControl && (
                <div className="absolute right-4 bottom-4">
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
                                disabled={AgnetDataCanBeChanged()}
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
                </div>
            )}
        </>
    );
}
