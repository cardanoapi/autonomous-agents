import { useEffect } from 'react';

import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import { IAgent, deleteAgentbyID, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplatebyID, fetchTemplates } from '@app/app/api/templates';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Switch } from '../atoms/Switch';

export interface IAgentCard {
    agentName: string;
    agentID: string;
    agentRole: string;
    templateID: string;
    functionCount: number;
    lastActive: string | null;
    totalTrigger: number;
    handleRemove?: any;
}

export default function AgentCard({
    agentName,
    agentID,
    agentRole,
    templateID,
    functionCount,
    lastActive,
    totalTrigger,
    handleRemove = () => {}
}: IAgentCard) {
    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateID}`],
        queryFn: () => fetchTemplatebyID(templateID)
    });

    const { data: currentagent } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });

    useEffect(() => {
        console.log(currentagent?.status);
    }, [currentagent]);

    return (
        <Card className="hover-transition-primary h-64 rounded-xl p-6 transition-all min-w-[260px] min-h-[257px] max-w-[260px] max-h-[257px]">
            <div className="flex items-center justify-between">
                <div className="card-h2">{agentName}</div>
                <div className="flex gap-x-2">
                    <div
                        onClick={() => {
                            handleRemove();
                        }}
                        className="cursor-pointer"
                    >
                        <Trash2 color="#A1A1A1" />
                    </div>
                    <Switch checked={currentagent?.status} />
                </div>
            </div>
            <CardTitle className="!card-h3">{agentRole}</CardTitle>
            <div className="mt-5 flex flex-col gap-y-2 text-brand-Gray-200">
                <CardContent className="flex flex-col gap-y-2">
                    <span className="card-h4">
                        Template :
                        <span className=" gray-background ml-1">
                            {template?.name || 'Nan'}
                        </span>
                    </span>
                    <span>
                        Function : <span className="text-active"> {functionCount}</span>
                    </span>
                    <span>
                        Last Active :
                        <span className="text-active">
                            {' '}
                            {lastActive?.split('T')[0]}
                        </span>
                    </span>
                    <span>
                        Total Triggers :
                        <span className="text-active"> {totalTrigger}</span>
                    </span>
                </CardContent>
            </div>
        </Card>
    );
}
