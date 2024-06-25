'use client';

import { getDRepList } from '@api/dRepDirectory';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { TypographyH2 } from '@typography';

import { Button } from '@app/components/atoms/Button';

import DRepCard from './components/DRepCard';

export default function DRepDirectory() {
    const { isLoading, data } = useQuery({
        queryKey: ['dRep list'],
        queryFn: () => getDRepList({})
    });

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div className="flex flex-col space-y-12 pb-12">
            <TypographyH2>Find a DRep</TypographyH2>

            <div className="flex flex-col space-y-4">
                {data?.elements.map((dRep) => <DRepCard dRep={dRep} />)}
            </div>

            <Button className="w-fit rounded-3xl text-blue-900" variant="outline">
                Show more
            </Button>
        </div>
    );
}
