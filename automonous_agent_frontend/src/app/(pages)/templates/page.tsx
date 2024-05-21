'use client';

import Head from 'next/head';
import Link from 'next/link';

import { template } from 'lodash';

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
import TemplateCard, { ITemplateCard } from '@app/components/molecules/TemplateCard';
import { useMutation } from '@tanstack/react-query';
import { deleteTemplatebyID } from '@app/app/api/templates';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

export default function TemplatesPage() {
    const {
        data: templates,
        isError: errorTemplates,
        isLoading: loadingTemplates
    } = useQuery<ITemplate[]>({ queryKey: ['templates'], queryFn: fetchTemplates });


    const deleteTemplate = useMutation({
        mutationFn : (templateID : string) => deleteTemplatebyID(templateID),
        onSuccess : ()=> {
            queryClient.refetchQueries({queryKey : ['templates']})}
    })

    function handleDelete(templateID : string){
        deleteTemplate.mutateAsync(templateID)
    }

    return (
        <div>
            <div className="flex justify-between">
                <div className="flex gap-x-4">
                    <SearchField
                        variant="secondary"
                        className="h-10 w-[60%] 2xl:w-[80%]"
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
                    <div className="grid grid-cols-4 gap-x-4 gap-y-4 2xl:grid-cols-5">
                        {templates?.map((item, index) => (
                            <TemplateCard
                                name={item.name}
                                id={item.id}
                                description={item.description}
                                templateTrigger={'null'}
                                key={index}
                                functionCount={0}
                                ondelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-y-5">
                    <span className="h5 inline-block">Existing Templates</span>
                    <div className="grid grid-cols-4 gap-x-4 gap-y-4 2xl:grid-cols-5">
                        {templates?.map((item, index) => (
                            <TemplateCard
                                name={item.name}
                                id={item.id}
                                description={item.description}
                                templateTrigger={'null'}
                                key={index}
                                functionCount={0}
                                ondelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
