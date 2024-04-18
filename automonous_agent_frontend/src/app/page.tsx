import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@app/components/atoms/Card';
import { DropdownMenu, DropdownMenuTrigger } from '@app/components/atoms/DropDownMenu';
import { Label } from '@app/components/atoms/label';
import OverViewCard, { IOverViewCard } from '@app/components/molecules/OverViewCard';

const OverViewItems: IOverViewCard[] = [
    {
        title: 'No of agents',
        value: 210
    },
    {
        title: 'No of templates',
        value: 15
    },
    {
        title: 'No of proposals',
        value: 6
    },
    {
        title: 'No of voters',
        value: 5321
    }
];

export default function Home() {
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>

            {/* Over cards that appearw on top*/}
            <div className="flex w-[1112px] justify-between">
                {OverViewItems.map((item, index) => (
                    <OverViewCard title={item.title} value={item.value} key={index} />
                ))}
            </div>

            {/* Dashboard Chart*/}
            <Card className="mt-8 flex h-[446px] w-[1110px] flex-row gap-y-0 pr-20">
                    <span className="h-[100%]  max-w-6 text-center [writing-mode:vertical-lr]">
                        No of Transactions
                    </span>
                <div className='w-[100%] ml-4'>
                    <div className="flex justify-between">
                        <Label size={'large'} className="text-[18px]">
                            Transactions
                        </Label>

                        <DropdownMenu>
                            <DropdownMenuTrigger>Today</DropdownMenuTrigger>
                        </DropdownMenu>
                    </div>
                </div>
            </Card>
        </>
    );
}
