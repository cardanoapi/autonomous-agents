'use client';

import { useEffect, useState } from 'react';
import React from 'react';

import Head from 'next/head';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { convertDictToGraphDataFormat } from '@app/components/Chart/ChartFilter';
import {
    IChartFilterOption,
    chartFilterOptions
} from '@app/components/Chart/ChartFilter';
import CustomLineChart from '@app/components/Chart/CustomLineChart';
import { ILineChartData } from '@app/components/Chart/CustomLineChart';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import DashboardCards from './components/DashboardCards';
import DashboardChart from '@app/components/Chart/DashboardChart';


export default function Home() {
    return (
        <div className={"flex md:flex-col flex-col-reverse"}>
            <DashboardCards />
            <DashboardChart className={"mb-4"}/>
        </div>
    );
}
