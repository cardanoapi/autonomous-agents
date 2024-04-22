import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Switch } from '../atoms/Switch';

export interface IAgentCard {
    agentName: string;
    agentRole: string;
    template: string;
    functionCount: number;
    lastActive: string;
    totalTrigger: number;
}

export default function AgentCard({
    agentName,
    agentRole,
    template,
    functionCount,
    lastActive,
    totalTrigger
}: IAgentCard) {
    return (
        <Card className="h-[257px] rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div className="card-h2">{agentName}</div>
                <Switch />
            </div>
            <CardTitle className="card-h3">{agentRole}</CardTitle>
            <div className="mt-5 flex flex-col gap-y-2 text-brand-Gray-200">
                <CardContent className="flex flex-col gap-y-2">
                    <span className="card-h4">
                        Template :{' '}
                        <span className=" gray-background ml-1">{template}</span>
                    </span>
                    <span>
                        Function : <span className="tex-active"> {functionCount}</span>
                    </span>
                    <span>
                        Last Active :<span className="text-active"> {lastActive}</span>
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
