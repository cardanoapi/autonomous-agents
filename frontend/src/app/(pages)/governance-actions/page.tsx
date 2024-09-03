'use client';

import { useState } from 'react';

import { fetchProposals } from '@api/proposals';
import { QUERY_KEYS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';

import EmptyGovActionPlaceholder from './components/EmptyGovActionPlaceholder';
import ProposalCard from './components/proposalCard';

function GovernanceAction() {
    const { ref } = useInView();
    //proposal types = all | internal
    const [searchParams, setSearchParams] = useState({
        page: 1,
        pageSize: 10,
        proposal_type: 'all',
        sort: 'NewestCreated'
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetInfoProposalListKey, searchParams],
        queryFn: () => fetchProposals(searchParams)
    });

    function toggleProposalType(value: string) {
        setSearchParams((prevParams: any) => ({
            ...prevParams,
            proposal_type: value
        }));
    }

    return (
        <div className="flex w-full flex-col gap-10 pb-10">
            <div className="flex items-center">
                <div className="flex gap-2">
                    <DataActionBar
                        onSearch={() => {}}
                        placeholder="Search Governance Action"
                    />

                    <ProposalFilterTab onClick={toggleProposalType} />
                </div>
            </div>
            <ScrollArea className="h-govActionsPageHeight">
                {isLoading ? (
                    <div className="flex h-proposalEmptyListHeight items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid w-full grid-flow-row grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {data?.items?.map((proposal: any) => (
                            <ProposalCard key={proposal.id} proposal={proposal} />
                        ))}
                    </div>
                )}
                {!isLoading && data?.items?.length == 0 && (
                    <EmptyGovActionPlaceholder className="h-govActionsPageHeight" />
                )}
                <div ref={ref} />
            </ScrollArea>
        </div>
    );
}

export default GovernanceAction;

interface ProposalFilterTabProps {
    onClick?: (value: string) => void;
}

const ProposalFilterTab = ({ onClick }: ProposalFilterTabProps) => {
    const handleClick = (value: string) => () => {
        if (onClick) {
            onClick(value);
        }
    };
    const triggerClassName = 'text-base border-gray-200 border-[1px] !h-full';
    return (
        <Tabs defaultValue="all" className="!m-0 !p-0">
            <TabsList className="!h-full !p-0">
                <TabsTrigger
                    value="all"
                    className={triggerClassName}
                    onClick={handleClick('all')}
                >
                    All Gov Actions
                </TabsTrigger>
                <TabsTrigger
                    value="internal"
                    className={triggerClassName}
                    onClick={handleClick('internal')}
                >
                    Internal Only
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
