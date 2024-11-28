'use client';

import { useEffect, useMemo, useState } from 'react';

import { fetchProposals } from '@api/proposals';
import { QUERY_KEYS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import DataActionBar from '@app/app/components/DataActionBar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import PaginationBtns from '@app/components/molecules/PaginationBtns';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';

import EmptyGovActionPlaceholder from './components/EmptyGovActionPlaceholder';
import ProposalCard, {
    ExternalProposalCardSkeleton,
    InternalProposalCardSkeleton
} from './components/proposalCard';

interface IProposalFilterOption {
    placeholder: string;
    value: string;
}

const proposalFilterOptions: IProposalFilterOption[] = [
    { placeholder: 'Internal Only', value: 'internal' },
    { placeholder: 'All Gov Actions', value: 'all' }
];

export default function GovernanceAction() {
    const { ref } = useInView();

    const [searchParams, setSearchParams] = useState({
        page: 1,
        pageSize: 10,
        proposal_type: 'internal',
        sort: 'NewestCreated',
        search: ''
    });

    const queryKey = useMemo(
        () => [QUERY_KEYS.useGetInfoProposalListKey, searchParams],
        [searchParams]
    );

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: () => fetchProposals(searchParams),
        refetchOnWindowFocus: true,
        staleTime: 5000
    });

    const handleSearch = (searchValue: string) => {
        setSearchParams((prev) => ({ ...prev, search: searchValue, page: 1 }));
    };

    const handleFilterChange = (filter: string) => {
        setSearchParams((prev) => ({ ...prev, proposal_type: filter, page: 1 }));
    };

    const handlePaginationChange = (page: number) => {
        setSearchParams((prev) => ({ ...prev, page: prev.page + page }));
    };

    const rowOptions = [10, 15, 20, 30];
    const [totalPage, setTotalPage] = useState(1);

    useEffect(() => {
        if (data) {
            setTotalPage(Math.max(Math.ceil(data.total / searchParams.pageSize), 1));
        }
    }, [data, searchParams.pageSize]);

    return (
        <div className="flex h-defaultPageHeightwithoutTopNav w-full flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 md:flex-row">
                    <DataActionBar
                        onSearch={handleSearch}
                        placeholder="Search Governance Action"
                    />
                    <ProposalFilterTab
                        onClick={handleFilterChange}
                        taboptions={proposalFilterOptions}
                        defaultValue={proposalFilterOptions[0].value}
                    />
                </div>
                <div>
                    <DropdownMenu>
                        <span className="hidden md:inline-flex">
                            Proposals per Page:{' '}
                        </span>
                        <DropdownMenuTrigger className="hidden md:inline-flex">
                            {searchParams.pageSize}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-0">
                            {rowOptions.map((row) => (
                                <DropdownMenuItem
                                    key={row}
                                    onClick={() =>
                                        setSearchParams((prev) => ({
                                            ...prev,
                                            pageSize: row,
                                            page: 1
                                        }))
                                    }
                                >
                                    {row}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <ScrollArea className="h-proposalListHeight md:pr-4">
                <div className="grid w-full grid-flow-row grid-cols-1 gap-8 py-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {!isLoading &&
                        data?.items?.map((proposal: any) => (
                            <ProposalCard key={proposal.id} proposal={proposal} />
                        ))}
                    {isLoading && (
                        <>
                            {searchParams.proposal_type === 'internal'
                                ? Array(10)
                                      .fill(0)
                                      .map((_, index) => (
                                          <InternalProposalCardSkeleton key={index} />
                                      ))
                                : Array(10)
                                      .fill(0)
                                      .map((_, index) => (
                                          <ExternalProposalCardSkeleton key={index} />
                                      ))}
                        </>
                    )}
                </div>
                {!isLoading && data?.items?.length === 0 && (
                    <EmptyGovActionPlaceholder className="h-full" />
                )}
                <div ref={ref} />
            </ScrollArea>
            <div className="pagination-btn-position flex flex-row-reverse">
                <PaginationBtns
                    upperLimit={totalPage}
                    onPaginate={handlePaginationChange}
                    refCurrentPage={searchParams.page}
                />
            </div>
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
    const triggerClassName =
        'md:text-base border-gray-200 border-[1px] !h-full  text-sm rounded-full md:rounded-sm';

    return (
        <Tabs defaultValue={defaultValue} className="!m-0 !p-0">
            <TabsList className="!h-full !p-0">
                {taboptions.map((option) => (
                    <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className={triggerClassName}
                        onClick={() => onClick?.(option.value)}
                    >
                        {option.placeholder}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
