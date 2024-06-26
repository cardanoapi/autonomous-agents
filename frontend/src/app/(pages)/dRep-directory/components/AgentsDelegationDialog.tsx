import React, { useMemo, useState } from 'react';

import { IAgent, fetchAgents, manualTriggerForAgent } from '@api/agents';
import { QUERY_KEYS } from '@consts';
import { useAppDialog } from '@hooks';
import { AgentFunction } from '@models/types';
import { CircularProgress } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAgentActive } from '@utils';

import AppDialog from '@app/app/components/AppDialog';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { Checkbox } from '@app/components/atoms/Checkbox';
import { cn } from '@app/components/lib/utils';

export default function AgentsDelegationDealog() {
    const { closeDialog } = useAppDialog();
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

    const { data: agents, isLoading } = useQuery<IAgent[]>({
        queryKey: [QUERY_KEYS.useFetchAgentsKey],
        queryFn: fetchAgents
    });

    const delegationMutation = useMutation({
        mutationFn: (id: string) => manualTriggerForAgent(id, AgentFunction.Delegation)
    });

    const activeAgents = useMemo(() => {
        return agents?.filter((agent) => isAgentActive(agent)) || [];
    }, [agents]);

    const isSubmitting = delegationMutation.isPending && !delegationMutation.isError;

    const handleSelect = (checked: string | boolean, agent: IAgent) => {
        if (checked) {
            setSelectedAgents([...selectedAgents, agent.id]);
        } else {
            setSelectedAgents(selectedAgents.filter((p) => p !== agent.id));
        }
    };

    const handleDelegation = async () => {
        const promises = selectedAgents.map((id) => delegationMutation.mutateAsync(id));
        await Promise.all(promises);

        closeDialog();
    };

    if (isLoading) return <Loader />;

    return (
        <AppDialog title="Delegate to DRep" description="Select agents for delegation.">
            <div className={cn('flex w-full flex-col space-y-2')}>
                {activeAgents.map((agent) => (
                    <div className="flex items-center space-x-2 rounded-lg border p-2 text-sm font-medium">
                        <Checkbox
                            onCheckedChange={(checked) => handleSelect(checked, agent)}
                        />
                        <p>{agent.name}</p>
                    </div>
                ))}
            </div>

            <Button
                disabled={selectedAgents.length === 0}
                onClick={handleDelegation}
                className="mt-6 w-full rounded-3xl bg-blue-900"
            >
                {isSubmitting ? <CircularProgress /> : 'Continue Delegation'}
            </Button>
        </AppDialog>
    );
}
