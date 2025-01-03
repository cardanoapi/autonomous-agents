import { IAgent } from '@api/agents';

import AgentsIcon from '@app/assets/icons/AgentsIcon';
import AgentRunnerTutorial from '@app/components/Agent/RunnerTutorial';

const AgentRunnerComponent = ({ agent }: { agent?: IAgent }) => {
    return (
        <div className={'flex h-full w-full flex-col gap-10 '}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            {agent && agent.secret_key && <AgentRunnerTutorial showToken agentSecretKey={agent.secret_key} />}
        </div>
    );
};

export default AgentRunnerComponent;
