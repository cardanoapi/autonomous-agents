'use client';

import { IAgent } from '@app/app/api/agents';
import { ITemplate } from '@app/app/api/templates';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import TextDisplayField from '@app/components/molecules/TextDisplayField';

const AgentOverViewComponent = ({
    agent,
    agentTemplate
}: {
    agent?: IAgent;
    agentTemplate?: ITemplate;
}) => {
    return (
        <div className={'flex flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Overview</span>
            </div>
            <TextDisplayField title={'Agent Name'} content={agent?.name} />
            <div className={'flex flex-col gap-2'}>
                <h1 className={'text-sm font-medium'}>Agent Template</h1>
                <div
                    className={
                        'flex w-[250px] flex-col gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md'
                    }
                >
                    <h1 className={' font-medium'}>{agentTemplate?.name}</h1>
                    <span className={'text-sm text-gray-700'}>
                        {agentTemplate?.description}
                    </span>
                </div>
            </div>
            <div className={'flex justify-between'}>
                <div className={'flex w-full items-center gap-1'}>
                    <TextDisplayField
                        title={'Wallet Address'}
                        content={agent?.agent_address}
                        showCopy
                    />
                </div>
                <TextDisplayField
                    title={'Wallet Balance'}
                    content={agent?.wallet_amount + ' Ada'}
                />
            </div>
            <TextDisplayField title={'Number of Agents'} content={agent?.instance} />
        </div>
    );
};

export default AgentOverViewComponent;
