'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@app/components/shadcn/ui/chart';

const chartData = [
    { browser: 'Successfull Transactions', visitors: 275, fill: 'var(--color-chrome)' },
    { browser: 'Failed Transactions', visitors: 200, fill: 'var(--color-safari)' },
    { browser: 'Skipped Transactions', visitors: 187, fill: 'var(--color-firefox)' }
];

const chartConfig = {
    visitors: {
        label: 'Transactions'
    },
    chrome: {
        label: 'Succcessfull',
        color: '#49CB7A'
    },
    safari: {
        label: 'Failed',
        color: '#ED6465'
    },
    firefox: {
        label: 'Skipped',
        color: '#838995'
    }
} satisfies ChartConfig;

export default function AgentCardFooter() {
    return (
        <ChartContainer config={chartConfig} className="h-full w-full bg-black">
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                    left: 0
                }}
            >
                <YAxis
                    dataKey="browser"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                        chartConfig[value as keyof typeof chartConfig]?.label || value
                    }
                />
                <XAxis dataKey="visitors" type="number" hide />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="visitors" layout="vertical" radius={5} />
            </BarChart>
        </ChartContainer>
    );
}
