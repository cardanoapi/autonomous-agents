'use client';

import { useEffect, useState } from 'react';
import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import {
    adminAccessAtom,
    currentConnectedWalletAtom,
    templateCreatedAtom
} from '@app/store/localStore';
import { IQueryParams } from '@app/utils/query';

import TemplateList from './components/TemplateList';
import TemplatesTopNav, { TemplatesTopNavSkeleton } from './components/TemplatesTopNav';

const TemplatesPage = () => {
    const [templateCreated, setTemplateCreated] = useAtom(templateCreatedAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);
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

    // Update first fetch flag
    useEffect(() => {
        if (isFirstFetch && templates.length > 0) {
            setIsFirstFetch(false);
        }
    }, [templates, isFirstFetch]);

    return (
        <>
            {/* Top Navigation */}
            {isLoading && isFirstFetch ? (
                <TemplatesTopNavSkeleton />
            ) : (
                <TemplatesTopNav
                    onSearch={handleSearch}
                    templatesCount={templates.length}
                    adminAccess={adminAccess}
                />
            )}

            {/* Template List */}
            <TemplateList
                templates={templates}
                isLoading={isLoading && isFirstFetch}
                adminAccess={adminAccess}
                currentConnectedWallet={currentConnectedWallet}
            />
        </>
    );
};

export default TemplatesPage;
