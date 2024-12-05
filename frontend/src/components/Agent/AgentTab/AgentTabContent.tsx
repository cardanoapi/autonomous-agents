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
                'h-full w-full rounded-lg bg-white p-6  md:p-8 overflow-hidden relative !pb-20',
                className
            )}
        >
            {getAgentSelectedTabComponent()}
        </div>
    );
};

export default AgentTabContent;
