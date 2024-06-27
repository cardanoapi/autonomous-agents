import React, { useEffect, useMemo, useState } from 'react';

import { isEmpty } from 'lodash';

import { IAgent, fetchAgents, manualTriggerForAgent } from '@api/agents';
import { QUERY_KEYS } from '@consts';
import { AgentFunction } from '@models/types';
import { CircularProgress } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAgentActive } from '@utils';

import { AppDialogContent } from '@app/app/components/AppDialog';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { Checkbox } from '@app/components/atoms/Checkbox';
import { cn } from '@app/components/lib/utils';

interface AgentsDelegationDialogContentProps {
    handleClose: () => void;
}

export default function AgentsDelegationDialogContent({
    handleClose
}: AgentsDelegationDialogContentProps) {
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

    const { data: agents, isLoading } = useQuery<IAgent[]>({
        queryKey: [QUERY_KEYS.useFetchAgentsKey],
        queryFn: fetchAgents
    });

    const delegationMutation = useMutation({
        mutationFn: (id: string) => manualTriggerForAgent(id, AgentFunction.Delegation)
    });

    const isSubmitting = delegationMutation.isPending && !delegationMutation.isError;
    const activeAgents = useMemo(() => {
        return agents?.filter((agent) => !isAgentActive(agent)) || [];
    }, [agents]);

    const handleSelect = (checked: string | boolean, agent: IAgent) => {
        if (checked) {
            setSelectedAgentIds([...selectedAgentIds, agent.id]);
        } else {
            setSelectedAgentIds(selectedAgentIds.filter((p) => p !== agent.id));
        }
    };

    const handleDelegation = async () => {
        const promises = selectedAgentIds.map((id) =>
            delegationMutation.mutateAsync(id)
        );
        await Promise.all(promises);

        handleClose();
    };

    useEffect(() => {
        // clear states
        return () => setSelectedAgentIds([]);
    }, []);

    if (isLoading) return <Loader />;

    return (
        <AppDialogContent
            title="Delegate to DRep"
            description="Select agents for delegation."
        >
            <div className={cn('flex w-full flex-col space-y-2')}>
                {activeAgents.map((agent) => (
                    <div
                        key={agent.id}
                        className="flex items-center space-x-2 rounded-lg border p-2 text-sm font-medium"
                    >
                        <Checkbox
                            onCheckedChange={(checked) => handleSelect(checked, agent)}
                        />
                        <p>{agent.name}</p>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleDelegation}
                disabled={isEmpty(selectedAgentIds)}
                className="mt-6 w-full rounded-3xl bg-blue-900"
            >
                {isSubmitting ? <CircularProgress /> : 'Continue Delegation'}
            </Button>
        </AppDialogContent>
    );
}
