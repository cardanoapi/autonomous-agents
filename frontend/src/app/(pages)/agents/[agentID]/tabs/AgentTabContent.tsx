'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import { cn } from '@app/components/shadcn/lib/utils';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { selectedAgentTabAtom } from '@app/store/localStore';

import AgentLogContent from '../content/AgentLogsContent';
import AgentOverViewContent from '../content/AgentOverviewContent';
import AgentSettingsContent from '../content/AgentSettingsContent';
import AgentFunctionsContent from '../content/AgentFunctionsContent';
import AgentManualTriggerContent from '../content/AgentManualActionsContent';

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
            return <AgentOverViewContent agent={agent} enableControl={enableEdit} />;
        else if (selectedAgentTab === 'Functions')
            return <AgentFunctionsContent agent={agent} enableControl={enableEdit} />;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogContent agent={agent} />;
        else if (enableEdit) {
            if (selectedAgentTab === 'Manual Actions')
                return <AgentManualTriggerContent agent={agent} />;
            else if (selectedAgentTab === 'Settings')
                return (
                    <AgentSettingsContent agent={agent} enableControl={enableEdit} />
                );
        }
    }
    //Logs and History tab have their own Skeleton handled inside the component
    return (
        <div className={cn('relative flex-1 rounded-lg bg-white p-8', className)}>
            <ScrollArea className="h-[95%] w-full pb-4 pr-4 pt-10">
                {agentLoading ? (
                    selectedAgentTab === 'Overview' ||
                    selectedAgentTab === 'Manual Actions' ||
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
    return <Skeleton className="absolute h-full w-full"></Skeleton>;
};
export default AgentTabContent;
