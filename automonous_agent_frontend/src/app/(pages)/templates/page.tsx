import Head from 'next/head';
import Link from 'next/link';

import { Button } from '@app/components/atoms/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import TemplateCard, { ITemplateCard } from '@app/components/molecules/TemplateCard';

import MyTemplates from './TemplatesContainer';
import TemplatesContainer from './TemplatesContainer';

const DemoTemplateCards: ITemplateCard[] = [
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 3 days',
        functionCount: 3,
        templateTrigger: 'Cron Trigger'
    },
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 3 days',
        functionCount: 7,
        templateTrigger: 'Cron Trigger'
    },
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 1 days',
        functionCount: 12,
        templateTrigger: 'Cron Trigger'
    },
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 56 days',
        functionCount: 56,
        templateTrigger: 'Cron Trigger'
    },
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 12 days',
        functionCount: 76,
        templateTrigger: 'Cron Trigger'
    },
    {
        templateName: 'Send Template Name',
        templateDescription: 'Sends Ada to eco charity every 3 days',
        functionCount: 3,
        templateTrigger: 'Cron Trigger'
    }
];

export default function TemplatesPage() {
    return (
        <div>

            <Head>
                <title>Template Form</title>
            </Head>

            <div className="flex justify-between">
                <div className="flex gap-x-4">
                    <SearchField
                        variant="secondary"
                        className="h-[40px] w-[240px]"
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

            <div className="flex flex-col gap-y-10 pb-10 pt-10">
                <div className='gap-y-5 flex flex-col'>
                    <span className='h5 inline-block'>My Templates</span>
                    <TemplatesContainer TemplateCards={DemoTemplateCards.slice(0, 3)} />
                </div>
                <div className='gap-y-5 flex flex-col'>
                   <span className='h5 inline-block'>Existing Templates</span>
                   <TemplatesContainer TemplateCards={DemoTemplateCards} />
                </div>

            </div>
        </div>
    );
}
