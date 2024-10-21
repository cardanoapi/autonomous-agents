'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import AgentManualTriggerComponent from '@app/components/Agent/AgentContent/ManualActions';
import AgentOverViewComponent from '@app/components/Agent/AgentContent/Overview';
import SkeletonLoadingForAgentOverview from '@app/components/Agent/shared/SkeletonLoadingForAgentOverview';
import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../../lib/utils';
import { ScrollArea, ScrollBar } from '../../shadcn/ui/scroll-area';
import { Skeleton } from '../../shadcn/ui/skeleton';
import AgentFunctionsComponent from '../AgentContent/Functions';
import AgentLogComponent from '../AgentContent/Logs';
import AgentSettingsComponent from '../AgentContent/Settings';

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
            return <AgentOverViewComponent agent={agent} enableControl={enableEdit} />;
        else if (selectedAgentTab === 'Functions')
            return <AgentFunctionsComponent agent={agent} enableControl={enableEdit}/>;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogComponent agent={agent} />;
        else if (enableEdit) {
            if (selectedAgentTab === 'Manual Actions')
                return <AgentManualTriggerComponent agent={agent} />;
            else if (selectedAgentTab === 'Settings')
                return <AgentSettingsComponent agent={agent} enableControl={enableEdit}/>;
        }
    }
    //Logs and History tab have their own Skeleton handled inside the component
    return (
        <div className={cn('relative flex-1 rounded-lg bg-white p-8', className)}>
            <ScrollArea className="h-[95%] w-full pb-4 pr-4 pt-10">
                <ScrollBar className="" />
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
            </ScrollArea>
        </div>
    );
};

export const DefaultSkeleton = () => {
    return <Skeleton className="h-full w-full"></Skeleton>;
};
export default AgentTabContent;
