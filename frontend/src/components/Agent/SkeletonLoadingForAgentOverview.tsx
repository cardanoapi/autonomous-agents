'use client';

import { Skeleton } from '@app/components/ui/skeleton';

const SkeletonLoadingForAgentOverview = () => {
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <Skeleton className={'h-5 w-[150px]'} />
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-10 w-[350px]'} />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-20 w-[350px]'} />
            </div>
            <div className={'flex justify-between'}>
                <div className={'flex flex-col gap-2'}>
                    <Skeleton className={'h-5 w-[150px]'} />
                    <Skeleton className={'h-10 w-[350px]'} />
                </div>
                <div className={'flex flex-col gap-2'}>
                    <Skeleton className={'h-5 w-[150px]'} />
                    <Skeleton className={'h-10 w-[350px]'} />
                </div>
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-5 w-[150px]'} />
                <Skeleton className={'h-10 w-[350px]'} />
            </div>
        </div>
    );
};

export default SkeletonLoadingForAgentOverview;
