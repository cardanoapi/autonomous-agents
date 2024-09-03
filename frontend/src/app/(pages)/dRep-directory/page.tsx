'use client';

import { useMemo, useRef, useState } from 'react';

import { getDRepList } from '@api/dRepDirectory';
import { useInfiniteQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard from './components/DRepCard';

export default function DRepDirectory() {
    const initialLoad = useRef(true);
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
        () => data?.pages.flatMap((page) => page.elements),
        [data]
    );

    const handleSearch = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    if (isLoading && !dRepList && initialLoad.current) {
        initialLoad.current = false;

        return (
            <div className="flex h-proposalEmptyListHeight items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <DataActionBar onSearch={handleSearch} placeholder="Search Drep" />

            {/* DRep list */}

            <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="flex flex-col space-y-4">
                    {dRepList?.map((dRep) => (
                        <DRepCard key={dRep.drepId} dRep={dRep} />
                    ))}
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
            </ScrollArea>
        </div>
    );
}
