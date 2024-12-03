import { IAgent } from '@api/agents';

import AgentCard, { AgentCardSkeleton } from '@app/components/molecules/AgentCard';

export interface AgentsContainerProps {
    agentsList: IAgent[];
    enableEdit: boolean;
    enableDelete: boolean;
}

const AgentsContainer: React.FC<AgentsContainerProps> = ({
    agentsList,
    enableEdit,
    enableDelete,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-4 ">
            {agentsList.map((agent) => (
                      <AgentCard
                          key={agent.id}
                          agentName={agent.name || 'NA'}
                          agentID={agent.id || ''}
                          functionCount={agent.total_functions || 0}
                          templateName={agent.template_name}
                          totalTrigger={0}
                          lastActive={agent.last_active || 'NA'}
                          enableEdit={enableEdit}
                          isActive={agent.is_active}
                          enableDelete={enableDelete}
                          no_of_successful_triggers={agent.no_of_successfull_triggers}
                          agentSecretKey={agent.secret_key}
                          className={'sm:mr-1'}
                      />
                  ))}
        </div>
    );
};

export default AgentsContainer;
