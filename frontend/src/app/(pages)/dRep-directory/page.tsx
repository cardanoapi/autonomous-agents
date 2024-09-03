'use client';

import { useState } from 'react';

import { fetchDreps } from '@api/dreps';
import { useQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard from './components/DRepCard';

export default function DRepDirectory() {
    const [queryParams, setQueryParams] = useState({
        page: 1,
        pageSize: 10,
        drep_type: 'all'
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetDRepListKey, queryParams],
        queryFn: () => fetchDreps({ ...queryParams })
    });

    const handleSearch = (searchValue: string) => {
        setQueryParams({ ...queryParams, drep_type: searchValue }); // Reset to page 1 on new search
    };

    const handleFilterChange = (filter: string) => {
        setQueryParams({ ...queryParams, drep_type: filter, page: 1 }); // Reset to page 1 on filter change
    };

    if (isLoading) {
        return (
            <div className="flex h-proposalEmptyListHeight items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <div className="flex gap-2">
                <DataActionBar
                    onSearch={handleSearch}
                    placeholder="Search DRep"
                    className="!w-[500px]"
                />
                <DrepFilterTab onClick={handleFilterChange} />
            </div>

            {/* DRep list */}
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="flex flex-col space-y-4">
                    {!isLoading &&
                        data?.items?.map((dRep) => (
                            <DRepCard key={dRep.drepId} dRep={dRep} />
                        ))}
                </div>
            </ScrollArea>
        </div>
    );
}

const DrepFilterTab = ({ onClick }: { onClick?: (value: string) => void }) => {
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
                    All Dreps
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
