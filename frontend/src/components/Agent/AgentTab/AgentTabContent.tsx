'use client';

import { IAgent } from '@api/agents';
import { useAtom } from 'jotai';

import AgentManualTriggerComponent from '@app/components/Agent/AgentContent/ManualActions';
import AgentOverViewComponent from '@app/components/Agent/AgentContent/Overview';
import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../../lib/utils';
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

    return (
        <div
            className={cn(
                'relative h-full w-full overflow-hidden rounded-lg  bg-white p-6 !pb-20 md:p-8',
                className
            )}
        >
            {agentLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-Blue-200"></div>
                </div>
            ) : (
                getAgentSelectedTabComponent()
            )}
        </div>
    );
};

export default AgentTabContent;