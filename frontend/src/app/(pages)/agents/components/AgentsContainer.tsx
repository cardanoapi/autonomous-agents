import { IAgent } from '@api/agents';

import AgentCard from '@app/components/molecules/AgentCard';
import { AgentCardSkeleton } from '@app/components/molecules/AgentCard';

export interface AgentsContainerProps {
    agentsList: IAgent[];
    enableEdit: boolean;
    enableDelete: boolean;
    loadingAgents?: boolean;
}

const AgentsContainer: React.FC<AgentsContainerProps> = ({
    agentsList,
    enableEdit,
    enableDelete,
    loadingAgents = false
}) => {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:pr-12 4xl:grid-cols-5 5xl:grid-cols-6">
            {loadingAgents
                ? Array.from({ length: 10 }).map((_, index) => (
                      <AgentCardSkeleton key={index} />
                  ))
                : agentsList.map((agent) => (
                      <AgentCard
                          key={agent.id}
                          agentName={agent.name || 'NA'}
                          agentID={agent.id || ''}
                          functionCount={agent.total_functions || 0}
                          templateID={agent.template_id}
                          totalTrigger={0}
                          lastActive={agent.last_active || 'NA'}
                          enableEdit={enableEdit}
                          isActive={agent.is_active}
                          enableDelete={enableDelete}
                      />
                  ))}
        </div>
    );
};

export default AgentsContainer;
