import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Switch } from '../atoms/Switch';

export interface IAgentCard {
    agentName: string;
    agentRole: string;
    template: string;
    funcionCount: number;
    lastActive: string;
    totalTrigger: number;
}

export default function AgentCard({
    agentName,
    agentRole,
    template,
    funcionCount,
    lastActive,
    totalTrigger
}: IAgentCard) {
    return (
        <Card className="h-[257px] w-[271px] p-6 rounded-[12px]">
            <div className="flex w-full items-center justify-between">
                <CardTitle className="text-base">{agentName}</CardTitle>
                <Switch />
            </div>
            <CardDescription className="text-gray-400">{agentRole}</CardDescription>
            <div className="mt-5 flex flex-col gap-y-2 text-[#4A4A4A]">
                <CardContent>
                    Template : <span className=' ml-1 px-2 py-1 bg-gray-100 text-black rounded-lg'>{template}</span>
                </CardContent>
                <CardContent>Function :<span className='text-[#252323]'>{funcionCount}</span></CardContent>
                <CardContent>Last Active :<span className='text-[#252323]'>{lastActive}</span></CardContent>
                <CardContent>Total Triggers 24hrs : <span className='##252323'>{totalTrigger}</span></CardContent>
            </div>
        </Card>
    );
}
