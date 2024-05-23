"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import CustomLineChart, { ILineChartData } from '@app/components/molecules/chart/CustomLineChart';
import OverViewAgentsCard from './components/OverViewAgentsCard';
import OverViewTemplatesCard from './components/OverViewTemplatesCard';
import OverViewTransactionsCard from './components/OverViewTransactionsCard';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchActiveAgentsCount, fetchAgents } from './api/agents';
import { fetchTemplates } from './api/templates';
import { fetchFunctions } from './api/functions';
import { fetchTransactionsCount, fetchTriggers } from './api/trigger';
import OverViewTriggerCard from './components/OverViewTriggerCard';


export interface IAgentsCardData {
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
}

export default function Home() {
    
    const [transactionChartData , setTransactionChartData] = useState<ILineChartData[]>([])
    const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: fetchAgents });
    const { data: activeAgents } = useQuery({ queryKey: ['activeAgentsCount'], queryFn: fetchActiveAgentsCount });
    const { data: templates = [] } = useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });
    const { data: triggers = []} = useQuery({ queryKey: ['Triggers'], queryFn : fetchTriggers });
    const { data: successfullTransactionCount = {} } = useQuery({ queryKey: ['totalSuccessfullTransactionCounts'], queryFn: () => fetchTransactionsCount('true') });
    const { data: unsuccessfullTransactionCount = {} } = useQuery({ queryKey: ['totalUnsuccessfulltransactionCounts'], queryFn: () => fetchTransactionsCount('false') });

    // Calculate the number of successful and unsuccessful transactions
    const successfullTransactions = Object.keys(successfullTransactionCount).length;
    const unsuccessfullTransactions = Object.keys(unsuccessfullTransactionCount).length;

    // Calculate the total number of transactions
    const totalTransactions = successfullTransactions + unsuccessfullTransactions;

    // Calculate the percentages
    const successPercentage = totalTransactions > 0 ? (successfullTransactions / totalTransactions) * 100 : 0;
    const unsuccessPercentage = totalTransactions > 0 ? (unsuccessfullTransactions / totalTransactions) * 100 : 0;

    const [transactionStats, setTransactionStats] = useState({
        totalTransactions: totalTransactions,
        successfullTransactions: successfullTransactions,
        unsuccessfullTransactions: unsuccessfullTransactions,
        successPercentage: successPercentage.toFixed(2),
        unsuccessPercentage: unsuccessPercentage.toFixed(2)
    });

    // Update the state when the successful or unsuccessful transactions change
    useEffect(() => {
        setTransactionStats({
            ...transactionStats,
            totalTransactions: totalTransactions,
            successfullTransactions: successfullTransactions,
            unsuccessfullTransactions: unsuccessfullTransactions,
            successPercentage: successPercentage.toFixed(2),
            unsuccessPercentage: unsuccessPercentage.toFixed(2)
        });
    }, [successfullTransactions, unsuccessfullTransactions]);


    
    useEffect(() => {
        if (successfullTransactionCount) {
            const newData: ILineChartData[] = Object.keys(successfullTransactionCount).map((item: string) => {
                return {
                    name: item,
                    amt: parseInt(successfullTransactionCount[item]) || 0
                };
            }); 
            setTransactionChartData(newData);
        }
    }, [successfullTransactionCount]);    


    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>

            {/* Agents Overview Card */}
            <div className="flex grid-cols-4 gap-[12px] 2xl:gap-[25px] h-36 ">
                <OverViewAgentsCard
                    title="No of Agents"
                    totalAgents={agents?.length || 'NA'}
                    activeAgents={activeAgents?.online_agents_count}
                    inactiveAgents={Math.max(0, agents?.length - activeAgents?.online_agents_count)}
                />
                <OverViewTemplatesCard
                    title="No of Templates"
                    totalTemplates={templates?.length}
                    defaultTemplates={templates?.length}
                    customTemplates={0}
                />
                {/* To do Overview cards */}
                <OverViewTransactionsCard
                    title='Total Transactions'
                    totalTransactions={transactionStats.totalTransactions}
                    successPercentage={transactionStats.successPercentage}
                    unsucessPercentage={transactionStats.unsuccessPercentage}
                />
                <OverViewTriggerCard
                    title="No of Triggers"
                    total={triggers.length}
                    active={triggers.length}
                    inactive={0}
                />
            </div>

            {/* Dashboard Chart*/}
            <Card className="mt-8 flex flex-row gap-y-8 py-4 pr-12  pb-16 pt-2 2xl:mt-12 5xl:mt-16">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    No of transaction
                </span>
                <div className="mt-5 w-full pr-6">
                    <div className="flex justify-between">
                        <span className="title-1">Live Transactions</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger border={true}>
                                Today
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='bg-white'>
                                <DropdownMenuItem>Last Hour</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className='h-[355px] mt-2 2xl:h-[500px] 4xl:h-[600px]'>
                        <CustomLineChart chartData={transactionChartData}/>
                    </div>
                </div>
            </Card>
        </>
    );
}
