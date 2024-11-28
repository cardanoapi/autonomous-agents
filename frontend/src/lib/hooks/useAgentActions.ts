import { useEffect, useMemo, useState } from 'react';

import { IAgent, fetchAgents, manualTriggerForAgent } from '@api/agents';
import { QUERY_KEYS } from '@consts';
import { AgentTriggerFunctionType } from '@models/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAgentActive } from '@utils';

import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

export type VoteType = 'Yes' | 'No' | 'Abstain';

export interface IAgentVote {
    agentId: string;
    voteType: VoteType;
}

function getAgentVoteData(voteType: VoteType, proposal: string) {
    return {
        function_name: 'voteOnProposal' as AgentTriggerFunctionType,
        parameters: [
            { name: 'proposal', value: proposal },
            { name: 'anchor', value: {} },
            { name: 'voteType', value: voteType }
        ]
    };
}
export const useAgentsAction = (
    triggerType: AgentTriggerFunctionType,
    handleClose: () => void,
    value: string
) => {
    const [selectedAgents, setSelectedAgents] = useState<IAgentVote[]>([]);
    const { data: agents, isLoading } = useQuery<IAgent[]>({
        queryKey: [QUERY_KEYS.useFetchAgentsKey],
        queryFn: async () => fetchAgents({ page: 1, size: 100, search: '' })
    });

    const actionMutation = useMutation({
        mutationFn: (agentVote: IAgentVote) =>
            manualTriggerForAgent(
                agentVote.agentId,
                getAgentVoteData(agentVote.voteType, value)
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

    const handleSelect = (checked: boolean | string, agentVoteData: IAgentVote) => {
        if (checked) {
            setSelectedAgents((prev) => [...prev, agentVoteData]);
        } else {
            setSelectedAgents((prev) =>
                prev.filter((voteData) => voteData.agentId !== agentVoteData.agentId)
            );
        }
    };

    const handleAction = async () => {
        const promises = selectedAgents.map((agentVoteData) =>
            actionMutation.mutateAsync(agentVoteData)
        );
        await Promise.all(promises);
    };

    useEffect(() => {
        return () => setSelectedAgents([]);
    }, []);

    return {
        activeAgents,
        isLoading,
        isSubmitting,
        handleSelect,
        handleAction,
        selectedAgents
    };
};
