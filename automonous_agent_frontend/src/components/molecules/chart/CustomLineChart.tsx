'use client';

import { useEffect } from 'react';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import CustomTooltip from './CustomTooltip';

export interface ILineChartData {
    name: string;
    amt: number;
}

const demoData: ILineChartData[] = [
    { name: 'A', amt: 10 },
    { name: 'B', amt: 15 },
    { name: 'C', amt: 24 },
    { name: 'D', amt: 18 },
    { name: 'E', amt: 12 },
    { name: 'F', amt: 20 },
    { name: 'G', amt: 28 },
    { name: 'H', amt: 26 },
    { name: 'I', amt: 32 },
    { name: 'J', amt: 34 }
];

export default function CustomLineChart({
    chartData,
    className,
    strokeColor = '#1C63E7',
    strokeGradiantColor = '#0093FD1A',
    fillGradiant = true,
    strokeWidth = '5',
    renderLines = false,
    renderDot = false,
    renderToolTip = true,
    renderXaxis = true,
    renderYaxis = true
}: {
    chartData: ILineChartData[];
    className?: string;
    strokeColor?: string;
    strokeGradiantColor? : string
    fillGradiant? : boolean;
    strokeWidth?: string;
    renderLines?: boolean;
    renderDot?: boolean;
    renderToolTip?: boolean;
    renderXaxis? : boolean,
    renderYaxis? : boolean
}) {

    useEffect(() => {
        console.log(chartData);
    }, [chartData]);

    return (
        <ResponsiveContainer width="100%" height="100%" className={className}>
            <AreaChart
                data={demoData}
                margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeGradiantColor} stopOpacity={1} />
                        <stop offset="90%" stopColor={strokeGradiantColor} stopOpacity={0} />
                    </linearGradient>
                </defs>
                {renderLines && (
                <CartesianGrid
                    strokeDasharray="0"
                    vertical={false}
                    stroke="#A2A3A5"
                    strokeOpacity={0.4}
                />
                )}
                {renderYaxis && (
                <YAxis
                    dx={-10}
                    tickCount={4}
                    axisLine={false}
                    tickLine={false}
                    stroke="#A2A3A5"
                />
                )}
                {renderToolTip && (
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ strokeDasharray: 5, stroke: '#1C63E7' }}
                    />
                )}
                <Area
                    type="monotone"
                    dataKey="amt"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fillOpacity={1}
                    fill={fillGradiant ? "url(#colorUv)" : strokeColor}
                    isAnimationActive={false}
                    strokeLinecap="round"
                    dot={renderDot}
                    activeDot={{ r: 8 }}
                />
                {renderXaxis && (
                <XAxis tickLine={false} dy={5} fill="#2196F3" stroke="#A2A3A5"></XAxis>
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
}
