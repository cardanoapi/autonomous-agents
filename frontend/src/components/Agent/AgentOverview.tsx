'use client';

import { IAgent, ICronTrigger } from '@app/app/api/agents';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import TextDisplayField from '@app/components/molecules/TextDisplayField';

const AgentOverViewComponent = ({ agent }: { agent?: IAgent }) => {
    return (
        <div className={'flex flex-col gap-10 '}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Overview</span>
            </div>
            <div
                className={
                    'flex h-agentComponentHeight flex-col gap-10 overflow-y-auto pr-4 '
                }
            >
                <TextDisplayField title={'Agent Name'} content={agent?.name} />
                <div className={'flex flex-col gap-2'}>
                    <h1 className={'text-sm font-medium'}>Agent Functions</h1>
                    <div className={'flex flex-row flex-wrap gap-4 '}>
                        {agent?.agent_configurations?.map((config) => {
                            return (
                                <div
                                    className={
                                        'flex w-[280px] flex-col flex-wrap gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md'
                                    }
                                    key={config.agentId}
                                >
                                    <span className={'text-sm text-gray-700'}>
                                        Name : {config?.action?.function_name}
                                    </span>
                                    <span className={'text-sm text-gray-700'}>
                                        Type : {config.type}
                                    </span>
                                    <span className={'text-sm text-gray-700'}>
                                        Probability :{' '}
                                        {(config.data as ICronTrigger).probability
                                            ? (config.data as ICronTrigger).probability
                                            : 1}
                                    </span>
                                </div>
                            );
                        })}
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
                <TextDisplayField
                    title={'Number of Agents'}
                    content={agent?.instance}
                />
            </div>
        </div>
    );
};

export default AgentOverViewComponent;
