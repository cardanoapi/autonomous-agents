'use client';

import { useEffect, useMemo, useState } from 'react';

import { fetchProposals } from '@api/proposals';
import { QUERY_KEYS } from '@consts';
import { useQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
import { cn } from '@app/components/lib/utils';
import EmptyScreen from '@app/components/molecules/EmptyScreen';
import PaginationBtns from '@app/components/molecules/PaginationBtns';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import ProposalCard from './components/proposalCard';

interface IProposalFilterOption {
    placeholder: string;
    value: string;
}

const proposalFilterOptions: IProposalFilterOption[] = [
    { placeholder: 'Internal Only', value: 'internal' },
    { placeholder: 'All Gov Actions', value: 'all' }
];

export default function GovernanceAction() {
    const [searchParams, setSearchParams] = useState({
        page: 1,
        pageSize: 10,
        proposal_type: 'internal',
        sort: 'NewestCreated',
        search: ''
    });

    const queryKey = useMemo(() => [QUERY_KEYS.useGetInfoProposalListKey, searchParams], [searchParams]);

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
        <>
            <GovActionTopNav
                handleSearch={handleSearch}
                handleFilterChange={handleFilterChange}
                setSearchParams={setSearchParams}
                searchParams={searchParams}
                proposalFilterOptions={proposalFilterOptions}
            />

            {!isLoading && data?.items && data?.items?.length > 0 && (
                <div className="grid h-full w-full grid-flow-row grid-cols-1 gap-8 overflow-y-auto py-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
                    {data?.items?.map((proposal: any) => <ProposalCard key={proposal.id} proposal={proposal} />)}
                </div>
            )}
            {!isLoading && data?.items?.length === 0 && searchParams.proposal_type === 'internal' && (
                <EmptyScreen
                    msg="No Internal Proposals Found"
                    linkMsg="View all proposals"
                    linkOnCLick={() => handleFilterChange('all')}
                />
            )}
            {!isLoading && data?.items?.length === 0 && searchParams.proposal_type !== 'internal' && (
                <EmptyScreen msg="No External Proposals Found" />
            )}
            {isLoading && <Skeleton className="h-full w-full"></Skeleton>}
            <div className={cn('flex flex-row-reverse', data?.items?.length === 0 && 'hidden')}>
                <PaginationBtns
                    upperLimit={totalPage}
                    onPaginate={handlePaginationChange}
                    refCurrentPage={searchParams.page}
                    rowOptions={rowOptions}
                    rowsLabel="Proposals per page"
                    onRowClick={(row: number) =>
                        setSearchParams((prev) => ({
                            ...prev,
                            pageSize: row,
                            page: 1
                        }))
                    }
                    rowsPerPage={searchParams.pageSize}
                />
            </div>
        </>
    );
}

const GovActionTopNav = ({
    handleSearch,
    handleFilterChange,
    searchParams,
    proposalFilterOptions
}: {
    handleSearch: (searchValue: string) => void;
    handleFilterChange: (filter: string) => void;
    setSearchParams: (params: any) => void;
    searchParams: any;
    proposalFilterOptions: IProposalFilterOption[];
}) => {
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-y-4">
            <div className="flex flex-col gap-2 md:flex-row">
                <DataActionBar onSearch={handleSearch} placeholder="Search Governance Action" />
                <ProposalFilterTab
                    onClick={handleFilterChange}
                    taboptions={proposalFilterOptions}
                    value={searchParams.proposal_type || proposalFilterOptions[0].value}
                />
            </div>
        </div>
    );
};

const ProposalFilterTab = ({
    taboptions,
    value,
    onClick
}: {
    taboptions: IProposalFilterOption[];
    onClick?: (value: string) => void;
    value: string;
}) => {
    const triggerClassName =
        'md:text-base border-gray-200 border-[1px] !h-full  text-sm rounded-full md:rounded-sm mr-1 md:mr-0';

    return (
        <Tabs value={value} className="!m-0 !p-0">
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
