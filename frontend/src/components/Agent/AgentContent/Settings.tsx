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
        agentConfigurations: agent?.agent_configurations,
        agentConfig: { system_prompt: agent?.config?.system_prompt ?? '' }
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
                agentConfigurations: agent?.agent_configurations,
                agentConfig: { system_prompt: agent?.config?.system_prompt ?? '' }
            });
        }
        setIsEditing(false);
    };

     const isDataUnchanged = () => {
        if (!agent) return true; 
        
        const isNameSame = agentData.agentName === agent.name;
        const isInstanceSame = agentData.instance === agent.instance;
       
        const isPromptSame = (agentData.agentConfig?.system_prompt ?? '') === (agent.config?.system_prompt ?? '');

        return isNameSame && isInstanceSame && isPromptSame;
    };
    return (
        <>
            <div className="flex w-full flex-col md:w-[60%] ">
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
                        onChange={(e: any) => setAgentData({ ...agentData, agentName: e.target.value })}
                    />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <Label>Agent Instance</Label>
                    <NumberInput
                        value={agentData.instance}
                        className="mx-[2px]"
                        viewOnly={!isEditing}
                        onChange={(e: any) => setAgentData({ ...agentData, instance: e.target.value })}
                        min={1}
                    />
                </div>
                   <div className="mt-4 flex flex-col gap-2">
                    <Label>System Prompt</Label>
                    <textarea
                        value={agentData.agentConfig?.system_prompt}
                        readOnly={!isEditing}
                        onChange={(e) =>
                            setAgentData({
                                ...agentData,
                                agentConfig: { system_prompt: e.target.value }
                            })
                        }
                        className={`mx-[2px] h-40 min-h-24 rounded-md border p-2 text-sm font-mono ${
                            !isEditing
                                ? 'border-transparent bg-gray-100 text-gray-500'
                                : 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }`}
                        placeholder={isEditing ? 'Enter system prompt...' : 'Not set'}
                    />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <Label>Secret Key</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            value={showSecret ? agent?.secret_key || '' : '*'.repeat(agent?.secret_key?.length || 10)}
                            className="mx-[2px]"
                            viewOnly={true}
                        />
                        {showSecret ? (
                            <EyeOff
                                onClick={() => setShowSecret(!showSecret)}
                                className="cursor-pointer text-gray-400"
                            />
                        ) : (
                            <Eye onClick={() => setShowSecret(!showSecret)} className="cursor-pointer text-gray-400" />
                        )}
                    </div>
                </div>
            </div>
            {enableControl && (
                <div className="absolute bottom-4 right-4">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button variant={'secondary'} size={'sm'} className="min-w-32" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                variant={'primary'}
                                size={'sm'}
                                className="min-w-32"
                                onClick={handleAgentUpdate}
                                disabled={isDataUnchanged()}
                            >
                                Save
                            </Button>
                        </div>
                    ) : (
                        <Button variant={'primary'} size={'sm'} className="min-w-32" onClick={toggleEdit}>
                            Edit
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
