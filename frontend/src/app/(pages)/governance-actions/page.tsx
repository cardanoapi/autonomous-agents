'use client';

import { useMemo, useRef, useState } from 'react';

import { getProposalList } from '@api/governanceActions';
import { QUERY_KEYS } from '@consts';
import { ProposalListSort } from '@models/types/proposal';
import { useInfiniteQuery } from '@tanstack/react-query';

import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { SearchField } from '@app/components/atoms/SearchField';

import ProposalCard from './components/proposalCard';

function GovernanceAction() {
    const initialLoad = useRef(true);
    const [searchInput, setSearchInput] = useState('');

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
                return searchInput === '' &&
                    lastPage.pageSize * lastPage.page + lastPage.pageSize <
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

    console.log(proposalList?.length, 'length');
    const handleSearch = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    if (isLoading && !proposalList && initialLoad.current) {
        initialLoad.current = false;

        return <Loader />;
    }

    return (
        <div className="flex w-full flex-col gap-10 pb-10">
            <SearchField
                placeholder="Search..."
                variant={'secondary'}
                className="h-10 max-w-[510px] "
                onSearch={handleSearch}
            ></SearchField>
            <div className="grid w-full grid-flow-row grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {proposalList?.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
            </div>
            {hasNextPage && !isFetchingNextPage && (
                <div className=" flex justify-center">
                    <Button
                        onClick={() => fetchNextPage()}
                        className="w-fit rounded-3xl text-blue-900"
                        variant="outline"
                    >
                        Show more
                    </Button>
                </div>
            )}
        </div>
    );
}

export default GovernanceAction;
