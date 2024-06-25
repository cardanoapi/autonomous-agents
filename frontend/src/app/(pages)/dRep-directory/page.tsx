'use client';

import { useMemo, useState } from 'react';

import { getDRepList } from '@api/dRepDirectory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { TypographyH2, TypographyHeading } from '@typography';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import AutomaticDelegationOptions from './components/AutomaticDelegationOptions';
import DRepCard from './components/DRepCard';

export default function DRepDirectory() {
    const [searchInput, setSearchInput] = useState('');

    const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
        useInfiniteQuery({
            queryKey: [QUERY_KEYS.useGetDRepListKey, searchInput],
            queryFn: ({ pageParam = 0 }) =>
                getDRepList({ searchPhrase: searchInput, page: pageParam }),
            getNextPageParam: (lastPage) => {
                return lastPage.page + 1 < lastPage.total
                    ? lastPage.page + 1
                    : undefined;
            },
            initialPageParam: 0
        });

    const dRepList = useMemo(
        () => data?.pages.flatMap((page) => page.elements) || [],
        [data]
    );

    const handleSearch = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    if (isLoading && !dRepList) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <TypographyH2>Find a DRep</TypographyH2>

            {/* Automatic Delegation */}
            <div className="flex flex-col space-y-4">
                <TypographyHeading className="font-normal">
                    Delegation Options
                </TypographyHeading>
                <AutomaticDelegationOptions />
            </div>

            <DataActionBar onSearch={handleSearch} />

            {/* DRep list */}
            <div className="flex flex-col space-y-4">
                {dRepList?.map((dRep) => <DRepCard dRep={dRep} />)}
            </div>

            {hasNextPage && !isFetchingNextPage && (
                <div className="flex justify-center">
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
