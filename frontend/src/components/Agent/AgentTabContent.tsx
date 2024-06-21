'use client';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Copy } from 'lucide-react';

import { IAgent } from '@app/app/api/agents';
import { IFunction, fetchFunctions } from '@app/app/api/functions';
import { ITemplate } from '@app/app/api/templates';
import AgentHistoryComponent from '@app/components/Agent/AgentHistory';
import AgentOverViewComponent from '@app/components/Agent/AgentOverview';
import SkeletonLoadingForAgentOverview from '@app/components/Agent/SkeletonLoadingForAgentOverview';
import { useModal } from '@app/components/Modals/context';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import environments from '@app/configs/environments';
import { selectedAgentTabAtom } from '@app/store/loaclStore';

import AgentLogComponent from './AgentLog';

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

const AgentRunnerComponent = ({ agent }: { agent?: IAgent }) => {
    const dockerCommand = `docker run -e WS_URL=${environments.NEXT_PUBLIC_WS_URL} -e AGENT_ID=${agent?.id} cardanoapi/cardano-autonomous-agent-agent-node:
    ${environments.NEXT_PUBLIC_IMAGE_TAG}`;
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <div className={'flex flex-col gap-6'}>
                <span className={''}>Run this agent by following tutorial:</span>
                <div className={'flex flex-col gap-2'}>
                    <span className={'text-base font-semibold text-brand-Black-100'}>
                        Using Docker:
                    </span>
                    <div className={'flex w-full items-center gap-1'}>
                        <div
                            onClick={() => {
                                navigator.clipboard.writeText(dockerCommand);
                                SuccessToast('Docker Command Copied!');
                            }}
                            className={
                                'w-fit cursor-pointer rounded bg-blue-100 p-2 font-sans text-sm drop-shadow-sm hover:text-brand-Black-300/90'
                            }
                        >
                            {dockerCommand}
                        </div>
                        <Copy
                            color="#A1A1A1"
                            className=" w- h-5 hover:cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(dockerCommand);
                                SuccessToast('Docker Command Copied!');
                            }}
                        />
                    </div>
                    <span className={'text-xs'}>
                        Note:{' '}
                        <span>
                            If you dont have docker installed then you can install it
                            from here{' '}
                            <Link
                                className={'text-blue-500'}
                                target={'_blank'}
                                href={'https://docs.docker.com/engine/install/'}
                            >
                                Docker Installation Guide.
                            </Link>
                        </span>
                    </span>
                </div>
                {/*<div className={'flex flex-col gap-2'}>*/}
                {/*    <span className={'text-base font-semibold text-brand-Black-100'}>*/}
                {/*        Running below script :*/}
                {/*    </span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

const AgentManualTriggerComponent = ({ agent }: { agent?: IAgent }) => {
    const { data: functions } = useQuery<IFunction[]>({
        queryKey: ['functions'],
        queryFn: fetchFunctions
    });
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <span>Available functions:</span>
            <ScrollArea className={'w-full overflow-y-auto pr-4'}>
                <div
                    className={
                        'grid h-full w-full grid-cols-1 gap-10 py-4 md:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4'
                    }
                >
                    {functions &&
                        functions.map((func: IFunction) => {
                            return (
                                <AgentFunctionCard
                                    key={func.function_name}
                                    func={func}
                                    agentId={agent?.id || ''}
                                />
                            );
                        })}
                </div>
            </ScrollArea>
        </div>
    );
};

const AgentFunctionCard = ({ func, agentId }: { func: IFunction; agentId: string }) => {
    const { openModal } = useModal();
    const handleClick = () => {
        openModal('AgentManualTriggerView', { agentFunction: func, agentId });
    };
    return (
        <div
            onClick={handleClick}
            className={
                'flex h-[120px] w-full cursor-pointer flex-col gap-2 rounded-md bg-gray-100 px-3 py-2 drop-shadow-md hover:bg-gray-200 lg:w-[270px]'
            }
        >
            <span className={'text-base'}>{func.function_name}</span>
            <span className={'text-xs text-brand-Black-300/80'}>
                {func?.description || 'No Description'}
            </span>
        </div>
    );
};

export default AgentTabContent;
