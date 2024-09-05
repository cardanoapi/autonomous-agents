'use client';

import { useState } from 'react';

import { fetchDreps } from '@api/dreps';
import { useQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard, { DRepCardSkeleton } from './components/DRepCard';

interface IDrepFilterOption {
    placeholder: string;
    value: string;
}
const DrepFilterOptions: IDrepFilterOption[] = [
    {
        placeholder: 'Internal Only',
        value: 'internal'
    },
    {
        placeholder: 'All DReps',
        value: 'all'
    }
];

export default function DRepDirectory() {
    const [queryParams, setQueryParams] = useState({
        page: 1,
        pageSize: 10,
        drep_type: 'internal'
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetDRepListKey, queryParams],
        queryFn: () => fetchDreps({ ...queryParams })
    });

    const handleSearch = (searchValue: string) => {
        setQueryParams({ ...queryParams, drep_type: searchValue });
    };

    const handleFilterChange = (filter: string) => {
        setQueryParams({ ...queryParams, drep_type: filter, page: 1 });
    };

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <div className="flex gap-2">
                <DataActionBar
                    onSearch={handleSearch}
                    placeholder="Search DRep"
                    className="!w-[500px]"
                />
                <DrepFilterTab
                    onClick={handleFilterChange}
                    taboptions={DrepFilterOptions}
                    defaultValue={DrepFilterOptions[0].value}
                />
            </div>

            {/* DRep list */}
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="flex flex-col space-y-4">
                    {!isLoading &&
                        data?.items?.map((dRep) => (
                            <DRepCard key={dRep.drepId} dRep={dRep} />
                        ))}
                    {isLoading &&
                        Array.from({ length: 10 }).map((_, i) => (
                            <DRepCardSkeleton key={i} />
                        ))}
                </div>
            </ScrollArea>
        </div>
    );
}

const DrepFilterTab = ({
    taboptions,
    onClick,
    defaultValue
}: {
    taboptions: IDrepFilterOption[];
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
