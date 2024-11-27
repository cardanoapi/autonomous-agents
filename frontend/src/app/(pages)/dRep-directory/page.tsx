'use client';

import { useEffect, useState } from 'react';

import { fetchDreps } from '@api/dreps';
import { useQuery } from '@tanstack/react-query';
import { bech32toHex } from '@utils';

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
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard, { DRepCardSkeleton } from './components/DRepCard';
import EmptyIcon from '@app/components/icons/EmptyIcon';

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
        drep_type: 'internal',
        search: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.useGetDRepListKey, queryParams],
        queryFn: () => fetchDreps({ ...queryParams }),
        refetchOnWindowFocus: true,
        staleTime: 5000
    });

    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);

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

    const rowOptions = [10, 15, 20, 30];

    const [totalPage, setTotalPage] = useState<number>(1);
    const [rowsFilter, setRowsFilter] = useState<number>(rowOptions[0]);

    useEffect(() => {
        if (data) {
            setTotalPage(Math.ceil(data?.total / queryParams.pageSize) || 1);
            setRowsFilter(queryParams.pageSize);
        }
    }, [data, queryParams.pageSize]);

    useEffect(() => {
        isFirstFetch && setIsFirstFetch(false);
    }, [data]);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className="md:!mt-4 flex h-defaultPageHeightwithoutTopNav flex-col md:space-y-12 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col md:flex-row gap-2 ">
                    <DataActionBar
                        onSearch={handleSearch}
                        placeholder="Search DRep ID"
                        className="md:w-[500px]"
                    />
                    <DrepFilterTab
                        onClick={handleFilterChange}
                        taboptions={DrepFilterOptions}
                        defaultValue={DrepFilterOptions[0].value}
                    />
                </div>
                <div className={"hidden"}>
                    <DropdownMenu>
                        <span>Dreps per Page: </span>
                        <DropdownMenuTrigger className="inline-flex">
                            {rowsFilter || rowOptions[0]}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-0">
                            {rowOptions.map((row: number) => (
                                <DropdownMenuItem
                                    key={row}
                                    onClick={() =>
                                        setQueryParams({
                                            ...queryParams,
                                            pageSize: row,
                                            page: 1
                                        })
                                    }
                                >
                                    {row}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {/* DRep list */}
            <ScrollArea className="h-drepListHeight pb-4 md:pr-4">
                <div className="flex flex-col space-y-4">
                    {!isLoading &&
                        data &&
                        data?.items?.map((dRep, index) => (
                            <DRepCard key={index} dRep={dRep} />
                        ))}
                    {isLoading &&
                        Array.from({ length: 10 }).map((_, i) => (
                            <DRepCardSkeleton
                                key={i}
                                internalDRep={queryParams.drep_type === 'internal'}
                            />
                        ))}
                </div>
            </ScrollArea>

            <div className="pagination-btn-position flex flex-row-reverse">
                <PaginationBtns
                    upperLimit={totalPage}
                    onPaginate={handlePaginationChange}
                    refCurrentPage={queryParams.page}
                />
            </div>
            {
                data && data?.items?.length === 0 && (
                    <div className="flex w-full h-full items-center justify-center">
                        <EmptyIcon
                            style={{
                                height: "50%",
                                width: "50%",
                                fill: "#c8c8c8",
                            }}
                        />
                    </div>
                )
            }
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
    const triggerClassName = 'md:text-base border-gray-200 border-[1px] !h-full text-sm rounded-full md:rounded-sm';
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
