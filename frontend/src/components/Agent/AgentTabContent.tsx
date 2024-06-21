'use client';

import { useAtom } from 'jotai';

import { IAgent } from '@app/app/api/agents';
import { ITemplate } from '@app/app/api/templates';
import AgentHistoryComponent from '@app/components/Agent/AgentHistory';
import AgentManualTriggerComponent from '@app/components/Agent/AgentManualTrigger';
import AgentOverViewComponent from '@app/components/Agent/AgentOverview';
import SkeletonLoadingForAgentOverview from '@app/components/Agent/SkeletonLoadingForAgentOverview';
import { selectedAgentTabAtom } from '@app/store/loaclStore';

import AgentLogComponent from './AgentLog';
import AgentRunnerComponent from './AgentRunner';

const AgentTabContent = ({
    agent,
    agentTemplate,
    agentLoading
}: {
    agent?: IAgent;
    agentTemplate?: ITemplate;
    agentLoading?: boolean;
}) => {
    const [selectedAgentTab] = useAtom(selectedAgentTabAtom);

    function getAgentSelectedTabComponent() {
        if (selectedAgentTab === 'Overview')
            return (
                <AgentOverViewComponent agent={agent} agentTemplate={agentTemplate} />
            );
        else if (selectedAgentTab === 'History')
            return <AgentHistoryComponent agent={agent} />;
        else if (selectedAgentTab === 'Logs')
            return <AgentLogComponent agent={agent} />;
        else if (selectedAgentTab === 'Manual Trigger')
            return <AgentManualTriggerComponent agent={agent} />;
        else if (selectedAgentTab === 'Agent Runner')
            return <AgentRunnerComponent agent={agent} />;
    }

    return (
        <div className={'max-h-[600px] flex-1 rounded-lg bg-white px-9 py-6'}>
            {agentLoading ? (
                <SkeletonLoadingForAgentOverview />
            ) : (
                getAgentSelectedTabComponent()
            )}
        </div>
    );
};

export default AgentTabContent;