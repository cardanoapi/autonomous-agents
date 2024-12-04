import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { IAgent, fetchMyAgent } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai/index';

import AgentAvatar from '@app/components/Agent/shared/AgentAvatar';
import { cn } from '@app/components/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';

export default function MyAgentCard({ className , onClick }: { className?: string , onClick?: any}) {
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const router: AppRouterInstance = useRouter();

    const { data: agent } = useQuery({
        queryKey: ['myAgent'],
        queryFn: async (): Promise<IAgent | null> => {
            return fetchMyAgent();
        },
        enabled: currentConnectedWallet !== null && !adminAccess,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: 5000,
        refetchIntervalInBackground: true
    });
    if (!agent) return <MyAgentSkeleton />;
    return (
        <div
            className={cn(
                'flex items-center gap-x-4 gap-y-2 rounded-lg border-2 border-brand-Gray-400 p-2 hover:cursor-pointer hover:bg-gray-100',
                className
            )}
            onClick={(): void => {
                onClick?.();
                router.push(`/agents/${agent?.id}`);
            }}
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
