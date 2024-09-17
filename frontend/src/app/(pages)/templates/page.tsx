'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import DataActionBar from '@app/app/components/DataActionBar';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import TemplateCard from '@app/components/molecules/TemplateCard';
import { TemplateCardSkeleton } from '@app/components/molecules/TemplateCard';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import {
    adminAccessAtom,
    currentConnectedWalletAtom,
    templateCreatedAtom
} from '@app/store/localStore';
import { IQueryParams } from '@app/utils/query';

export default function TemplatesPage() {
    const [templateCreated, setTemplateCreated] = useAtom(templateCreatedAtom);

    const [adminAccess] = useAtom(adminAccessAtom);

    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);

    const [queryParams, setQueryParams] = useState<IQueryParams>({
        page: 1,
        size: 50,
        search: ''
    });

    const { data: templates = [], isLoading: isLoading } = useQuery<ITemplate[]>({
        queryKey: ['templates', queryParams],
        queryFn: () => fetchTemplates(queryParams)
    });

    useEffect(() => {
        if (templateCreated) {
            SuccessToast('Template Created Successfully');
            setTemplateCreated(false);
        }
    }, [templateCreated, setTemplateCreated]);

    const handleSearch = (value: string) => {
        setQueryParams({ page: 1, size: 50, search: value });
    };

    const containerClass =
        'grid grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5 3xl:pr-12';

    useEffect(() => {
        if (isFirstFetch) {
            setIsFirstFetch(false);
        }
    }, [templates]);

    useEffect(() => {
        console.log(isLoading, isFirstFetch);
    }, [templates]);

    return (
        <>
            {(isLoading && isFirstFetch && <TopNavSkeleton />) || (
                <TopNav
                    onSearch={handleSearch}
                    templatesCount={templates.length}
                    adminAccess={adminAccess}
                />
            )}

            <div className="flex flex-col gap-y-[80px] pb-10 pt-5">
                <div className="mt-2 flex flex-col gap-y-5">
                    {isLoading && isFirstFetch ? (
                        <div className={containerClass}>
                            <TemplateSkeletonContainer />
                        </div>
                    ) : templates.length > 0 ? (
                        <div className={containerClass}>
                            {templates.map((template: ITemplate, index: number) => (
                                <TemplateCard
                                    template={template}
                                    key={index}
                                    enableDelete={
                                        adminAccess === true &&
                                        currentConnectedWallet !== null
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <span>No Templates Found</span>
                    )}
                </div>
            </div>
        </>
    );
}

const TemplateSkeletonContainer = () => {
    return (
        <>
            {Array(10)
                .fill(undefined)
                .map((_, index: number) => {
                    return <TemplateCardSkeleton key={index} />;
                })}
        </>
    );
};

const TopNav = ({
    templatesCount,
    onSearch,
    adminAccess
}: {
    onSearch: any;
    templatesCount: number;
    adminAccess: boolean;
}) => {
    return (
        <div className="flex justify-between">
            <div className="flex items-center justify-center gap-x-4">
                <span className="h1-new">Templates({templatesCount})</span>
                <DataActionBar
                    className="h-10 min-w-[420px]"
                    placeholder="Search Templates "
                    onSearch={onSearch}
                />
            </div>
            <Link href="/templates/create-template">
                <Button
                    variant="primary"
                    className={cn('h-[36px] w-[145px]', adminAccess ? '' : '!hidden')}
                >
                    Create Template
                </Button>
            </Link>
        </div>
    );
};

const TopNavSkeleton = () => {
    return (
        <div className="flex justify-between ">
            <div className="flex items-center gap-x-4">
                <Skeleton className="h-8 w-[140px]" />
                <Skeleton className="h-10 min-w-[420px]" />
            </div>
        </div>
    );
};
