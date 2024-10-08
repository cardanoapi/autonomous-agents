import React from 'react';

import AgentRunnerTutorial from '@app/components/Agent/RunnerTutorial';
import { Separator } from '@app/components/shadcn/ui/separator';

const AgentRunnerModalView = ({ agentSecretKey }: { agentSecretKey: string }) => {
    return (
        <div className={'flex h-full w-full flex-col '}>
            <span className={'px-5 py-2 text-base font-medium'}>Agent Runner</span>
            <Separator />
            <div className={'px-5 py-4'}>
                <AgentRunnerTutorial agentSecretKey={agentSecretKey} />
            </div>
        </div>
    );
};

export default AgentRunnerModalView;
