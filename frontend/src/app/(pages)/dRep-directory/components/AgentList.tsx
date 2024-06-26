'use client';

import React, { useState } from 'react';

import { IAgent, fetchAgents } from '@api/agents';
import { QUERY_KEYS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { isAgentActive } from '@utils';

import Loader from '@app/app/components/Loader';
import { Badge } from '@app/components/atoms/Badge';
import { Checkbox } from '@app/components/atoms/Checkbox';

export default function AgentList() {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

    const { data: agents, isLoading } = useQuery<IAgent[]>({
        queryKey: [QUERY_KEYS.useFetchAgentsKey],
        queryFn: fetchAgents
    });

    const handleSelect = (checked: string | boolean, agent: IAgent) => {
        if (checked) {
            setSelectedAgents([...selectedAgents, agent.id]);
        } else {
            setSelectedAgents(selectedAgents.filter((p) => p !== agent.id));
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="flex w-full flex-col space-y-2">
            {agents?.map((agent) => (
                <div className="flex items-center space-x-2 rounded-lg border p-2">
                    <Checkbox
                        onCheckedChange={(checked) => handleSelect(checked, agent)}
                        className="cursor-pointer"
                    />
                    <p className="text-sm font-medium">{agent.name}</p>

                    <Badge
                        variant="outline"
                        className={
                            isAgentActive(agent) ? 'text-green-600' : 'text-red-600'
                        }
                    >
                        {isAgentActive(agent) ? 'Active' : 'Offline'}
                    </Badge>
                </div>
            ))}
        </div>
    );
}
