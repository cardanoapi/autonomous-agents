'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import WalletSignInDialog from '@app/components/Auth/WalletSignInDialog';
import { Button } from '@app/components/atoms/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { templateCreatedAtom } from '@app/store/localStore';

import TemplatesContainer from './TemplatesContainer';

export default function TemplatesPage() {
    const { data: templates = [], isLoading } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });

    const [templateCreated, setTemplateCreated] = useAtom(templateCreatedAtom);
    const [filteredTemplates, setFilteredTemplates] = useState<ITemplate[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    useEffect(() => {
        if (templateCreated) {
            SuccessToast('Template Created Successfully');
            setTemplateCreated(false);
        }
    }, [templateCreated, setTemplateCreated]);

    useEffect(() => {
        if (templates.length !== 0) {
            setFilteredTemplates(templates);
        }
    }, [templates]);

    function handleSearch(templateName: string) {
        const newTemplates =
            templates?.filter((template) =>
                template.name.toLowerCase().includes(templateName.toLowerCase())
            ) || [];
        setFilteredTemplates(newTemplates);
    }

    return (
        <>
            <WalletSignInDialog />
            <div className="flex justify-between">
                <div className="flex items-center justify-center gap-x-4">
                    <span className="h1-new">Templates({templates?.length})</span>
                    <SearchField
                        variant="secondary"
                        className="h-10 min-w-[240px]"
                        placeholder="Search Templates"
                        onSearch={handleSearch}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger border={true}>
                            Function
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                            <DropdownMenuItem>Send Ada</DropdownMenuItem>
                            <DropdownMenuItem>Vote Proposal</DropdownMenuItem>
                            <DropdownMenuItem>Others</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Link href="/templates/create-template">
                    <Button variant="primary" className="h-[36px] w-[145px]">
                        Create Template
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-y-[80px] pb-10 pt-10">
                <div className="mt-2 flex flex-col gap-y-5">
                    <span className="h5 inline-block">My Templates</span>
                    {filteredTemplates.length ? (
                        isLoading ? (
                            <TemplatesSkeleton />
                        ) : (
                            <TemplatesContainer templates={filteredTemplates} />
                        )
                    ) : (
                        <span>No Templates Found</span>
                    )}
                </div>
            </div>
        </>
    );
}

const TemplatesSkeleton = () => {
    return (
        <div className={'flex flex-row flex-wrap gap-4'}>
            {Array(4)
                .fill(undefined)
                .map((_, index: number) => {
                    return (
                        <Skeleton
                            key={index}
                            className={'h-[160px] w-[280px] rounded-lg'}
                        />
                    );
                })}
        </div>
    );
};
