'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ChevronLeft, Copy } from 'lucide-react';

import { IAgent, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import { fetchTransactionCountOfAgentById } from '@app/app/api/triggerHistory';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { cn } from '@app/components/lib/utils';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import CustomLineChart, {
    ILineChartData
} from '@app/components/molecules/chart/CustomLineChart';
import { Skeleton } from '@app/components/ui/skeleton';
import { selectedAgentTabAtom } from '@app/store/loaclStore';
import { getFilteredData } from '@app/utils/dashboard';

const AgentTabType = ['Overview', 'History'];

export default function AgentPageById() {
    const params = useParams();
    const router = useRouter();
    const agentID = params.agentID as string;

    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });
    const { data: templates = [] } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });
    const agentTemplate = templates.find(
        (template) => template.id === agent?.template_id
    );
    return (
        <div className={'flex flex-col gap-4'}>
            <div
                onClick={() => router.push('/agents')}
                className={
                    'flex w-fit cursor-pointer items-center rounded py-1 pl-1 pr-2 hover:bg-gray-300'
                }
            >
                <ChevronLeft />
                <span className={'text-base text-brand-Black-300'}>Back</span>
            </div>
            <div className={'flex h-full min-h-[600px] gap-4 '}>
                <AgentTabSection />
                <AgentTabComponent
                    agent={agent}
                    agentTemplate={agentTemplate}
                    agentLoading={agentLoading}
                />
            </div>
        </div>
    );
}

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

const TextDisplayField = ({
    title,
    content,
    showCopy = false
}: {
    title: string;
    content?: string | number;
    showCopy?: boolean;
}) => {
    return (
        <div className={'flex flex-col gap-2'}>
            <h1 className={'text-sm font-medium'}>{title}</h1>
            <div className={'flex items-center gap-1'}>
                <div
                    className={
                        'w-fit min-w-[360px] max-w-[600px] truncate rounded border-0 border-b border-gray-300 px-4 py-2 drop-shadow-md'
                    }
                >
                    {content}
                </div>
                {showCopy && (
                    <Copy
                        color="#A1A1A1"
                        onClick={() => {
                            navigator.clipboard.writeText(`${content}` || '');
                            SuccessToast(`${title}  Copied!`);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

const AgentHistoryComponent = ({ agent }: { agent?: IAgent }) => {
    const [currentChartFilter, setCurrentChartFilter] = useState('Last 24 Hours');
    const [filteredChartData, setFilteredChartData] = useState<ILineChartData[]>([]);

    const { data: agentTransactionCount, isLoading } = useQuery<any>({
        queryKey: [`agentTriggerHistory${agent?.id}`],
        queryFn: () => fetchTransactionCountOfAgentById(agent?.id || '')
    });

    useEffect(() => {
        const filteredData = agentTransactionCount
            ? getFilteredData(agentTransactionCount, currentChartFilter)
            : [];
        setFilteredChartData(filteredData);
    }, [currentChartFilter, agentTransactionCount]);

    if (isLoading)
        return (
            <div className={'flex h-full w-full flex-col gap-10'}>
                <Skeleton className={'h-5 w-[300px]'} />
                <Skeleton className={'h-full w-full'} />
            </div>
        );

    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent History</span>
            </div>
            <div
                className={
                    'flex h-full w-full flex-col gap-2 rounded border border-brand-White-200 p-4'
                }
            >
                <div>
                    <div className="flex justify-between">
                        <span className="title-1">Transactions</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger border={true}>
                                {currentChartFilter}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCurrentChartFilter('Last Hour');
                                    }}
                                >
                                    Last Hour
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCurrentChartFilter('Last 24 Hours');
                                    }}
                                >
                                    Last 24 Hours
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CustomLineChart chartData={filteredChartData} />
            </div>
        </div>
    );
};

const AgentTabComponent = ({
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
    }

    return (
        <div className={'flex-1 rounded-lg bg-white px-9 py-6'}>
            {agentLoading ? (
                <SkeletonLoadingForAgentOverviewPage />
            ) : (
                getAgentSelectedTabComponent()
            )}
        </div>
    );
};

const SkeletonLoadingForAgentOverviewPage = () => {
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <Skeleton className={'h-5 w-[150px]'} />
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-10 w-[350px]'} />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-20 w-[350px]'} />
            </div>
            <div className={'flex justify-between'}>
                <div className={'flex flex-col gap-2'}>
                    <Skeleton className={'h-5 w-[150px]'} />
                    <Skeleton className={'h-10 w-[350px]'} />
                </div>
                <div className={'flex flex-col gap-2'}>
                    <Skeleton className={'h-5 w-[150px]'} />
                    <Skeleton className={'h-10 w-[350px]'} />
                </div>
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-10 w-[350px]'} />
            </div>
        </div>
    );
};

const AgentTabSection = () => {
    return (
        <div
            className={
                'flex min-h-full w-[200px] flex-col gap-2 rounded-lg bg-white py-6'
            }
        >
            {AgentTabType.map((item, index) => {
                return <AgentTabItem key={index} item={item} />;
            })}
        </div>
    );
};

const AgentTabItem = ({ item }: { item: any }) => {
    const [selectedTab, setSelectedTab] = useAtom(selectedAgentTabAtom);
    return (
        <div
            onClick={() => setSelectedTab(item)}
            className={cn(
                'cursor-pointer rounded p-2 px-4 text-brand-Black-100',
                selectedTab === item
                    ? ' bg-brand-Blue-100 text-blue-500'
                    : 'hover-transition-blue !text-brand-Black-100'
            )}
        >
            {item}
        </div>
    );
};
