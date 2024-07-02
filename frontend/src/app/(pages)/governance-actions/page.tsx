'use client';

import { useEffect, useMemo, useState } from 'react';

import { getProposalList } from '@api/governanceActions';
import { QUERY_KEYS } from '@consts';
import { ProposalListSort } from '@models/types/proposal';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';

import ProposalCard from './components/proposalCard';

function GovernanceAction() {
    const [searchInput, setSearchInput] = useState('');

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView]);

    const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
        useInfiniteQuery({
            queryKey: [QUERY_KEYS.useGetInfoProposalListKey, searchInput],
            queryFn: ({ pageParam = 0 }) =>
                getProposalList({
                    searchPhrase: searchInput,
                    page: pageParam,
                    sorting: ProposalListSort.NewestCreated
                }),
            getNextPageParam: (lastPage) => {
                return lastPage.pageSize * lastPage.page + lastPage.pageSize <
                    lastPage.total
                    ? lastPage.page + 1
                    : undefined;
            },
            initialPageParam: 0
        });

    const proposalList = useMemo(
        () => data?.pages.flatMap((page) => page.elements),
        [data]
    );

    const handleSearch = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    return (
        <div className="flex w-full flex-col gap-10 pb-10">
            <DataActionBar onSearch={handleSearch} />
            {isLoading && !proposalList ? (
                <div className="flex h-proposalEmptyListHeight items-center justify-center">
                    <Loader />
                </div>
            ) : (
                <div className="grid w-full grid-flow-row grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {proposalList?.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                </div>
            )}
            {hasNextPage && (
                <div className="my-10" ref={ref}>
                    <Loader />
                </div>
            )}
        </div>
    );
}

export default GovernanceAction;
