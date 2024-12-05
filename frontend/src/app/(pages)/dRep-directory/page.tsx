'use client';

import { useEffect, useState } from 'react';

import { fetchDreps } from '@api/dreps';
import { useQuery } from '@tanstack/react-query';
import { bech32toHex } from '@utils';

import DataActionBar from '@app/app/components/DataActionBar';
import { cn } from '@app/components/lib/utils';
import EmptyScreen from '@app/components/molecules/EmptyScreen';
import PaginationBtns from '@app/components/molecules/PaginationBtns';
import { Tabs, TabsList, TabsTrigger } from '@app/components/molecules/Tabs';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard from './components/DRepCard';

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
    const rowOptions = [10, 15, 20, 30];
    const [totalPage, setTotalPage] = useState<number>(1);

    const [queryParams, setQueryParams] = useState({
        page: 1,
        pageSize: 10,
        drep_type: 'internal',
        search: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetDRepListKey, queryParams],
        queryFn: () => fetchDreps({ ...queryParams }),
        refetchOnWindowFocus: true,
        staleTime: 5000
    });

    const handleSearch = (searchValue: string) => {
        setQueryParams({ ...queryParams, search: bech32toHex(searchValue), page: 1 });
    };

    const handleFilterChange = (filter: string) => {
        setQueryParams({ ...queryParams, drep_type: filter, page: 1 });
    };

    const handlePaginationChange = (page: number) => {
        setQueryParams((prevParams) => ({
            ...prevParams,
            page: prevParams.page + page
        }));
    };

    useEffect(() => {
        if (data) {
            setTotalPage(Math.ceil(data?.total / queryParams.pageSize) || 1);
        }
    }, [data, queryParams.pageSize]);

    return (
        <>
            <DRepTopNav
                handleSearch={handleSearch}
                handleFilterChange={handleFilterChange}
                queryParams={queryParams}
                DrepFilterOptions={DrepFilterOptions}
            />
            {!isLoading && data && data?.items?.length > 0 && (
                <div className="flex h-full w-full flex-col space-y-4 overflow-y-auto">
                    {data?.items?.map((dRep, index) => (
                        <DRepCard key={index} dRep={dRep} />
                    ))}
                </div>
            )}
            {!isLoading &&
                data?.items?.length === 0 &&
                queryParams.drep_type === 'internal' && (
                    <EmptyScreen
                        msg="No Internal Dreps Found"
                        linkMsg="View all Dreps"
                        linkOnCLick={() => handleFilterChange('all')}
                    />
                )}

            {!isLoading &&
                data?.items?.length === 0 &&
                queryParams.drep_type === 'all' && <EmptyScreen msg="No Dreps Found" />}
            {isLoading && <Skeleton className="h-full w-full" />}
            <div
                className={cn(
                    'flex flex-row-reverse',
                    data?.items.length === 0 && 'hidden'
                )}
            >
                <PaginationBtns
                    upperLimit={totalPage}
                    onPaginate={handlePaginationChange}
                    refCurrentPage={queryParams.page}
                    rowsPerPage={queryParams.pageSize}
                    rowOptions={rowOptions}
                    onRowClick={(row: number) => {
                        setQueryParams({ ...queryParams, pageSize: row, page: 1 });
                    }}
                    rowsLabel="Rows per page"
                />
            </div>
        </>
    );
}

const DRepTopNav = ({
    handleSearch,
    handleFilterChange,
    queryParams,
    DrepFilterOptions
}: {
    handleSearch: (searchValue: string) => void;
    handleFilterChange: (filter: string) => void;
    queryParams: any;
    DrepFilterOptions: any;
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-col gap-2 md:flex-row ">
                <DataActionBar
                    onSearch={handleSearch}
                    placeholder="Search DRep ID"
                    className="w-full"
                />
                <DrepFilterTab
                    onClick={handleFilterChange}
                    taboptions={DrepFilterOptions}
                    value={queryParams.drep_type}
                />
            </div>
        </div>
    );
};

const DrepFilterTab = ({
    taboptions,
    onClick,
    value
}: {
    taboptions: IDrepFilterOption[];
    onClick?: (value: string) => void;
    value: string;
}) => {
    const handleClick = (value: string) => () => {
        if (onClick) {
            onClick(value);
        }
    };
    const triggerClassName =
        'md:text-base border-gray-200 border-[1px] !h-full text-sm mr-1 md:mr-0 rounded-full md:rounded-sm';
    return (
        <Tabs value={value} className="!m-0 !p-0">
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
