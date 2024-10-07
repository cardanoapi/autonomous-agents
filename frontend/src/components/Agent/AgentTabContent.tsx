'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import AgentHistoryComponent from '@app/components/Agent/AgentHistory';
import AgentManualTriggerComponent from '@app/components/Agent/AgentManualTrigger';
import AgentOverViewComponent from '@app/components/Agent/AgentOverview';
import SkeletonLoadingForAgentOverview from '@app/components/Agent/SkeletonLoadingForAgentOverview';
import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../lib/utils';
import { Skeleton } from '../shadcn/ui/skeleton';
import AgentLogComponent from './AgentLog';
import AgentRunnerComponent from './AgentRunner';

const AgentTabContent = ({
    agent,
    agentLoading,
    enableEdit,
    className
}: {
    agent?: IAgent;
    agentLoading?: boolean;
    enableEdit?: boolean;
    className?: string;
}) => {
    const [selectedAgentTab] = useAtom(selectedAgentTabAtom);

    function getAgentSelectedTabComponent() {
        if (selectedAgentTab === 'Overview')
            return <AgentOverViewComponent agent={agent} enableEdit={enableEdit} />;
        else if (selectedAgentTab === 'Functions')
            return <AgentHistoryComponent agent={agent} />;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogComponent agent={agent} />;
        else if (enableEdit) {
            if (selectedAgentTab === 'Manual Actions')
                return <AgentManualTriggerComponent agent={agent} />;
            else if (selectedAgentTab === 'Settings')
                return <AgentRunnerComponent agent={agent} />;
        }
    }
    //Logs and History tab have their own Skeleton handled inside the component
    return (
        <div className={cn('flex-1 rounded-lg bg-white px-4 py-6 ', className)}>
            {agentLoading ? (
                selectedAgentTab === 'Overview' ? (
                    <SkeletonLoadingForAgentOverview />
                ) : selectedAgentTab === 'Manual Actions' ||
                  selectedAgentTab === 'Settings' ? (
                    <DefaultSkeleton />
                ) : null
            ) : (
                getAgentSelectedTabComponent()
            )}
        </div>
    );
};

export const DefaultSkeleton = () => {
    return <Skeleton className="h-full w-full"></Skeleton>;
};
export default AgentTabContent;
