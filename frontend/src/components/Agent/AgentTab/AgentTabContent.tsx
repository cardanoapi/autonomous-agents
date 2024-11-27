'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import AgentManualTriggerComponent from '@app/components/Agent/AgentContent/ManualActions';
import AgentOverViewComponent from '@app/components/Agent/AgentContent/Overview';
import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../../lib/utils';
import { ScrollArea } from '../../shadcn/ui/scroll-area';
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
            return <AgentFunctionsComponent agent={agent} enableControl={enableEdit} />;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogComponent agent={agent} />;
        else if (enableEdit) {
            if (selectedAgentTab === 'Manual Actions')
                return <AgentManualTriggerComponent agent={agent} />;
            else if (selectedAgentTab === 'Settings')
                return (
                    <AgentSettingsComponent agent={agent} enableControl={enableEdit} />
                );
        }
    }
    //Logs and History tab have their own Skeleton handled inside the component
    return (
        <div className={cn('relative h-full flex-1 rounded-lg bg-white md:p-8 p-6 pb-0', className)}>
            <ScrollArea className="md:h-[95%] w-full md:pb-4 md:pr-4 md:pt-10 ">
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
