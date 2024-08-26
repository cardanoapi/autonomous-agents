'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import { Button } from '@app/components/atoms/Button';
import { SearchField } from '@app/components/atoms/SearchField';
import { cn } from '@app/components/lib/utils';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import TemplateCard from '@app/components/molecules/TemplateCard';
import { TemplateCardSkeleton } from '@app/components/molecules/TemplateCard';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { adminAccessAtom, templateCreatedAtom } from '@app/store/localStore';

export default function TemplatesPage() {
    const { data: templates = [], isLoading: isLoading } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });

    const [templateCreated, setTemplateCreated] = useAtom(templateCreatedAtom);
    const [adminAccess] = useAtom(adminAccessAtom);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    useEffect(() => {
        if (templateCreated) {
            SuccessToast('Template Created Successfully');
            setTemplateCreated(false);
        }
    }, [templateCreated, setTemplateCreated]);

    const containerClass =
        'grid grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5';

    const TopNav = () => {
        return (
            <div className="flex justify-between">
                <div className="flex items-center justify-center gap-x-4">
                    <span className="h1-new">Templates({templates?.length})</span>
                    <SearchField
                        variant="secondary"
                        className="h-10 min-w-[420px]"
                        placeholder="Search Templates"
                    />
                </div>
                <Link href="/templates/create-template">
                    <Button
                        variant="primary"
                        className={cn(
                            'h-[36px] w-[145px]',
                            adminAccess ? '' : '!hidden'
                        )}
                    >
                        Create Template
                    </Button>
                </Link>
            </div>
        );
    };

    const TopNavSkeleton = () => {
        return (
            <div className="flex justify-between p-2">
                <div className="flex items-center gap-x-4">
                    <Skeleton className="h-8 w-[140px]" />
                    <Skeleton className="h-10 min-w-[420px]" />
                </div>
            </div>
        );
    };

    return (
        <>
            {isLoading ? <TopNavSkeleton /> : <TopNav />}

            <div className="flex flex-col gap-y-[80px] pb-10 pt-10">
                <div className="mt-2 flex flex-col gap-y-5">
                    {isLoading ? (
                        <div className={containerClass}>
                            <TemplateSkeletonContainer />
                        </div>
                    ) : templates.length > 0 ? (
                        <div className={containerClass}>
                            {templates.map((template: ITemplate, index: number) => (
                                <TemplateCard
                                    template={template}
                                    key={index}
                                    enableEdit={adminAccess}
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
