import { useEffect, useMemo, useState } from 'react';

import { IAgent, fetchAgents, manualTriggerForAgent } from '@api/agents';
import { QUERY_KEYS } from '@consts';
import { AgentTriggerFunctionType } from '@models/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getConfiguredAgentTrigger, isAgentActive } from '@utils';

import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

export const useAgentsAction = (
    triggerType: AgentTriggerFunctionType,
    handleClose: () => void,
    value: string
) => {
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
    const { data: agents, isLoading } = useQuery<IAgent[]>({
        queryKey: [QUERY_KEYS.useFetchAgentsKey],
        queryFn: async () => fetchAgents({ page: 1, size: 100, search: '' })
    });

    const actionMutation = useMutation({
        mutationFn: (agentId: string) =>
            manualTriggerForAgent(
                agentId,
                getConfiguredAgentTrigger(triggerType, value)
            ),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['agents'] });
            SuccessToast(`${triggerType} has been successfully triggered.`);
            handleClose();
        },
        onError: () => {
            console.log('Error Response');
            ErrorToast('Error while manually triggering Agent Function. Try Again!');
        }
    });

    const isSubmitting = actionMutation.isPending && !actionMutation.isError;

    const activeAgents = useMemo(() => {
        return agents?.filter((agent) => isAgentActive(agent)) || [];
    }, [agents]);

    const handleSelect = (checked: boolean | string, agent: IAgent) => {
        if (checked) {
            setSelectedAgentIds((prev) => [...prev, agent.id]);
        } else {
            setSelectedAgentIds((prev) => prev.filter((id) => id !== agent.id));
        }
    };

    const handleAction = async () => {
        const promises = selectedAgentIds.map((agentId) =>
            actionMutation.mutateAsync(agentId)
        );
        await Promise.all(promises);
    };

    useEffect(() => {
        return () => setSelectedAgentIds([]);
    }, []);

    return {
        activeAgents,
        isLoading,
        isSubmitting,
        handleSelect,
        handleAction,
        selectedAgentIds
    };
};
