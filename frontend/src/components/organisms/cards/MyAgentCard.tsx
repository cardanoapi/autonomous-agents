import { IAgent } from '@api/agents';

import AgentAvatar from '@app/components/molecules/AgentAvatar';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

export default function MyAgentCard({
    agent,
    onClick = {}
}: {
    agent: IAgent | null | undefined;
    onClick?: any;
}) {
    if (!agent) return <MyAgentSkeleton />;
    return (
        <div
            className="flex items-center gap-x-4 gap-y-2 rounded-lg border-2 border-brand-Gray-400 p-2 hover:cursor-pointer hover:bg-gray-100"
            onClick={onClick}
        >
            <div className="flex items-center">
                <AgentAvatar
                    hash={agent.id}
                    size={32}
                    isActive={agent.is_active || false}
                    isLink={false}
                />
            </div>
            <div className="flex flex-col">
                <span className="h3 text-brand-Blue-200">My Agent</span>
                <span className="break-all text-xs text-brand-Black-200">
                    {agent.name}
                </span>
            </div>
        </div>
    );
}

export const MyAgentSkeleton = () => {
    return (
        <div className="flex items-center gap-x-4 gap-y-2 rounded-lg border-2 border-brand-Gray-400 p-2 hover:cursor-pointer">
            <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-col gap-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
};
