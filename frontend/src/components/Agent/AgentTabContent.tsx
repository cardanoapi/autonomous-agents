'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import AgentManualTriggerComponent from '@app/components/Agent/AgentManualTrigger';
import AgentOverViewComponent from '@app/components/Agent/AgentOverview';
import SkeletonLoadingForAgentOverview from '@app/components/Agent/SkeletonLoadingForAgentOverview';
import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../lib/utils';
import { Skeleton } from '../shadcn/ui/skeleton';
import AgentFunctionsComponent from './AgentFunctions';
import AgentLogComponent from './AgentLog';
import AgentSettingsComponent from './AgentSettings';

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
            return <AgentFunctionsComponent agent={agent} />;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogComponent agent={agent} />;
        else if (enableEdit) {
            if (selectedAgentTab === 'Manual Actions')
                return <AgentManualTriggerComponent agent={agent} />;
            else if (selectedAgentTab === 'Settings')
                return <AgentSettingsComponent agent={agent} enableEdit={enableEdit} />;
        }
    }
    //Logs and History tab have their own Skeleton handled inside the component
    return (
        <div className={cn('flex-1 rounded-lg bg-white p-8 ', className)}>
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
