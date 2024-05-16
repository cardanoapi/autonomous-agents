import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Switch } from '../atoms/Switch';
import { fetchTemplatebyID, fetchTemplates, ITemplate } from '@app/app/api/templates';
import { useEffect } from 'react';

export interface IAgentCard {
    agentName: string;
    agentRole: string;
    templateID : string;
    functionCount: number;
    lastActive: string | null;
    totalTrigger: number;
}

export default function AgentCard({
    agentName,
    agentRole,
    templateID,
    functionCount,
    lastActive,
    totalTrigger
}: IAgentCard) {
    
    const {data :template } = useQuery<ITemplate>({queryKey:['template'] , queryFn:()=>fetchTemplatebyID(templateID)})

    useEffect(()=>{
        console.log(template)
    },[template])

    return (
        <Card className="h-64 rounded-xl p-6 transition-all hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] hover:transition-all">
            <div className="flex items-center justify-between">
                <div className="card-h2">{agentName}</div>
                <Switch />
            </div>
            <CardTitle className="!card-h3">{agentRole}</CardTitle>
            <div className="mt-5 flex flex-col gap-y-2 text-brand-Gray-200">
                <CardContent className="flex flex-col gap-y-2">
                    <span className="card-h4">
                        Template :
                        <span className=" gray-background ml-1">{template?.name  || 'Nan'}</span>
                    </span>
                    <span>
                        Function : <span className="text-active"> {functionCount}</span>
                    </span>
                    <span>
                        Last Active :<span className="text-active"> {lastActive?.split('T')[0]}</span>
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
