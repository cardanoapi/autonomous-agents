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

interface IProposalFilterOption {
    placeholder: string;
    value: string;
}

const proposalFilterOptions: IProposalFilterOption[] = [
    {
        placeholder: 'Internal Only',
        value: 'internal'
    },
    {
        placeholder: 'All Gov Actions',
        value: 'all'
    }
];

export default function GovernanceAction() {
    const { ref } = useInView();

    const [searchParams, setSearchParams] = useState({
        page: 1,
        pageSize: 10,
        proposal_type: 'internal',
        sort: 'NewestCreated'
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetInfoProposalListKey, searchParams],
        queryFn: () => fetchProposals(searchParams)
    });

    const handleSearch = (searchValue: string) => {
        setSearchParams({ ...searchParams, proposal_type: searchValue });
    };

    const handleFilterChange = (filter: string) => {
        setSearchParams({ ...searchParams, proposal_type: filter, page: 1 });
    };

    if (isLoading) {
        return (
            <div className="flex h-proposalEmptyListHeight items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-10 pb-10">
            <div className="flex gap-2">
                <DataActionBar
                    onSearch={handleSearch}
                    placeholder="Search Governance Action"
                    className="!w-[500px]"
                />
                <ProposalFilterTab
                    onClick={handleFilterChange}
                    taboptions={proposalFilterOptions}
                    defaultValue={proposalFilterOptions[0].value}
                />
            </div>

            <ScrollArea className="h-govActionsPageHeight">
                <div className="grid w-full grid-flow-row grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {!isLoading &&
                        data?.items?.map((proposal: any) => (
                            <ProposalCard key={proposal.id} proposal={proposal} />
                        ))}
                </div>
                {!isLoading && data?.items?.length === 0 && (
                    <EmptyGovActionPlaceholder className="h-govActionsPageHeight" />
                )}
                <div ref={ref} />
            </ScrollArea>
        </div>
    );
}

const ProposalFilterTab = ({
    taboptions,
    onClick,
    defaultValue
}: {
    taboptions: IProposalFilterOption[];
    onClick?: (value: string) => void;
    defaultValue: string;
}) => {
    const handleClick = (value: string) => () => {
        if (onClick) {
            onClick(value);
        }
    };
    const triggerClassName = 'text-base border-gray-200 border-[1px] !h-full';
    return (
        <Tabs defaultValue={defaultValue} className="!m-0 !p-0">
            <TabsList className="!h-full !p-0">
                {taboptions.map((option) => (
                    <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className={triggerClassName}
                        onClick={handleClick(option.value)}
                    >
                        {option.placeholder}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
