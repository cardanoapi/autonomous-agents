'use client';

import { IAgent } from '@app/app/api/agents';
import AgentsIcon from '@app/components/icons/AgentsIcon';

const AgentLogComponent = ({ agent }: { agent?: IAgent }) => {
    console.log(agent);
    return (
        <div className={'flex flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Logs</span>
            </div>
            <div>Hello agent logs</div>
        </div>
    );
};

export default AgentLogComponent;
