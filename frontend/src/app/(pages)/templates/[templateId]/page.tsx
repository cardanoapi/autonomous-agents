'use client';

import React, { useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { ITemplate } from '@api/templates';
import { fetchTemplatebyID } from '@api/templates';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import TemplateOverview from '@app/components/organisms/TemplateOverview';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { templateAtom } from '@app/store/atoms/template';
import { adminAccessAtom } from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';

const EditTemplateCard = () => {
    const [adminAccess] = useAtom(adminAccessAtom);
    const [, setTemplate] = useAtom(templateAtom);

    const params = useParams();
    const templateId = params.templateId as string;

    const { data: template, isLoading: templateLoading } = useQuery<ITemplate>({
        queryKey: [`template${templateId}`],
        queryFn: () => fetchTemplatebyID(templateId || '')
    });

    useEffect(() => {
        if (template) {
            setTemplate(template);
        }
    }, [template]);

    return (
        <div className="mt-12 flex h-full w-full flex-col gap-6">
            <TemplateBreadCrumb templateName={template?.name} />
            <div className="relative h-full max-w-agentComponentWidth flex-1 rounded-lg bg-white p-8">
                {templateLoading && <Skeleton className=" h-[550px] w-full" />}
                {template && (
                    <TemplateOverview template={template} enableEdit={adminAccess} />
                )}
            </div>
        </div>
    );
};

const TemplateBreadCrumb = ({ templateName }: { templateName?: string }) => {
    const router = useRouter();
    return (
        <div className="flex h-full flex-col gap-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem
                        onClick={() => router.push('/templates')}
                        className="hover:cursor-pointer hover:text-brand-Blue-200"
                    >
                        Templates
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        {Truncate(templateName || '', 30) || 'Template Name'}
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default EditTemplateCard;
