'use client';

import { useEffect, useState } from 'react';

import { getDRepList } from '@api/dRepDirectory';
import { useQuery } from '@tanstack/react-query';
import { TypographyH2 } from '@typography';

import DataActionBar from '@app/app/components/DataActionBar';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { QUERY_KEYS } from '@app/consts/queryKeys';

import DRepCard from './components/DRepCard';

export default function DRepDirectory() {
    const [searchInput, setSearchInput] = useState('');
    const { isLoading, data } = useQuery({
        queryKey: [QUERY_KEYS.useGetDRepList, searchInput],
        queryFn: () => getDRepList({ searchPhrase: searchInput })
    });

    const handleSearch = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <TypographyH2>Find a DRep</TypographyH2>

            <DataActionBar onSearch={handleSearch} />

            <div className="flex flex-col space-y-4">
                {data?.elements.map((dRep) => <DRepCard dRep={dRep} />)}
            </div>

            <Button className="w-fit rounded-3xl text-blue-900" variant="outline">
                Show more
            </Button>
        </div>
    );
}
