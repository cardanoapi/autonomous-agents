'use client';

import { useEffect, useState } from 'react';
import React from 'react';

import { ITemplate, fetchTemplates } from '@api/templates';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { SuccessToast } from '@app/components/molecules/CustomToasts';
import EmptyScreen from '@app/components/molecules/EmptyScreen';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import {
    adminAccessAtom,
    currentConnectedWalletAtom,
    templateCreatedAtom
} from '@app/store/localStore';
import { IQueryParams } from '@app/utils/query';

import TemplateList from './components/TemplateList';
import TemplatesTopNav from './components/TemplatesTopNav';

const TemplatesPage = () => {
    const [templateCreated, setTemplateCreated] = useAtom(templateCreatedAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const [queryParams, setQueryParams] = useState<IQueryParams>({
        page: 1,
        size: 50,
        search: ''
    });

    const { data: templates = [], isLoading } = useQuery<ITemplate[]>({
        queryKey: ['templates', queryParams],
        queryFn: () => fetchTemplates(queryParams)
    });

    useEffect(() => {
        if (templateCreated) {
            SuccessToast('Template Created Successfully');
            setTemplateCreated(false);
        }
    }, [templateCreated, setTemplateCreated]);

    // Handle search update
    const handleSearch = (value: string) => {
        setQueryParams((prev) => ({ ...prev, search: value, page: 1 }));
    };

    return (
        <>
            <TemplatesTopNav onSearch={handleSearch} adminAccess={adminAccess} />
            {isLoading && <Skeleton className="h-full w-full" />}
            {!isLoading &&
                templates.length === 0 &&
                (adminAccess ? (
                    <EmptyScreen
                        msg="No Templates Found"
                        linkMsg="Create a Template to get started"
                        linkHref="/templates/create-template"
                    />
                ) : (
                    <EmptyScreen msg="No Templates Found" />
                ))}
            {!isLoading && templates.length > 0 && (
                <div className={'flex h-full w-full flex-col overflow-y-auto '}>
                    <TemplateList
                        templates={templates}
                        adminAccess={adminAccess}
                        currentConnectedWallet={currentConnectedWallet}
                    />
                </div>
            )}
        </>
    );
};

export default TemplatesPage;
