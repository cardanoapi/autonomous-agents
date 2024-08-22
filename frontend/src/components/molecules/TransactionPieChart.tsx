'use client';

import * as React from 'react';

import { Pie, PieChart } from 'recharts';

import { Card } from '@app/components/shadcn/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@app/components/shadcn/ui/chart';

export interface TransactionPieChartProps {
    className?: string;
    disabled?: boolean;
    success: number;
    skipped: number;
    failed: number;
}

interface IPieChartData {
    status: string;
    total: number;
    fill: string;
}

const chartConfig: ChartConfig = {
    total: {
        label: 'Transactions'
    },
    success: {
        label: 'Successful',
        color: '#49CB7A'
    },
    failed: {
        label: 'Failed',
        color: '#ED6465'
    },
    skipped: {
        label: 'Skipped',
        color: '#838995'
    },
    none: {
        label: 'none',
        color: '#D3D3D3'
    }
};

export default function TransactionPieChart({
    className,
    success,
    skipped,
    failed
}: TransactionPieChartProps) {
    const chartData: IPieChartData[] = React.useMemo(() => {
        if (success + skipped + failed === 0) {
            return [{ status: 'Not Activated ', total: 1, fill: 'var(--color-none)' }];
        }
        return [
            {
                status: 'Successful Transactions',
                total: success,
                fill: 'var(--color-success)'
            },
            {
                status: 'Failed Transactions',
                total: failed,
                fill: 'var(--color-failed)'
            },
            {
                status: 'Skipped Transactions',
                total: skipped,
                fill: 'var(--color-skipped)'
            }
        ];
    }, [success, skipped, failed]);

    return (
        <Card className={`${className}`}>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="total"
                        nameKey="status"
                        innerRadius={15}
                        strokeWidth={5}
                        isAnimationActive={false}
                    />
                </PieChart>
            </ChartContainer>
        </Card>
    );
}
