import Head from 'next/head';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
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

            {/* Agents Overview Card */}
            <div className="flex w-full justify-between">
                {OverViewItems.map((item, index) => (
                    <OverViewCard title={item.title} value={item.value} key={index} />
                ))}
            </div>

            {/* Dashboard Chart*/}
            <Card className="mt-8 flex flex-row h-[450px] pt-0">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    No of transaction
                </span>
                <div className="w-full mt-6 pr-6">
                    <div className="flex justify-between">
                        <span className='title-1'>
                            Transactions
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger border={true}>
                                Today
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Last 3 Days</DropdownMenuItem>
                                <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                                <DropdownMenuItem>Last Month</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Card>
        </>
    );
}
