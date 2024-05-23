'use client';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';

import { fetchTemplates, ITemplate } from '@app/app/api/templates';
import { Button } from '@app/components/atoms/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import TemplatesContainer from './TemplatesContainer';
import { templateCreatedAtom } from '@app/store/loaclStore';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { SuccessToast } from '@app/components/molecules/CustomToasts';

export default function TemplatesPage() {
    const {
        data: templates = [],
        isError: errorTemplates,
        isLoading: loadingTemplates
    } = useQuery<ITemplate[]>({ queryKey: ['templates'], queryFn: fetchTemplates });

    const [templateCreated , setTemplateCreated] = useAtom(templateCreatedAtom)

    useEffect(()=>{
        if (templateCreated === true){
            SuccessToast('Template Created Successfully')
            setTemplateCreated(false)
        }
    })

    return (
        <div>
            <div className="flex justify-between">
                <div className="flex gap-x-4">
                <span className="h1-new">Templates({templates?.length})</span>
                    <SearchField
                        variant="secondary"
                        className="h-10 min-w-[240px]"
                        placeholder="Search Templates"
                    ></SearchField>
                    <DropdownMenu>
                        <DropdownMenuTrigger border={true}>
                            Function
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
                    <TemplatesContainer templates={templates}/>
                </div>
                <div className="flex flex-col gap-y-5">
                    <span className="h5 inline-block">Existing Templates</span>
                    <TemplatesContainer templates={templates}/>
                </div>
            </div>
        </div>
    );
}
