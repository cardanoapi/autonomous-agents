'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { v4 as uuidv4 } from 'uuid';

import CustomTooltip from './CustomTooltip';

// Import the UUID library

export interface ILineChartData {
    name: string;
    amt: number;
}

export const demoCustomLineChartData: ILineChartData[] = [
    { name: 'A', amt: 0 },
    { name: 'B', amt: 0 },
    { name: 'C', amt: 0 },
    { name: 'D', amt: 0 },
    { name: 'E', amt: 0 },
    { name: 'F', amt: 0 },
    { name: 'G', amt: 0 },
    { name: 'H', amt: 0 },
    { name: 'I', amt: 0 },
    { name: 'J', amt: 0 }
];

export default function CustomLineChart({
    chartData,
    className,
    strokeColor = '#1C63E7',
    strokeCoverColor = '#0093FD1A',
    fillGradiant = true,
    strokeWidth = '5',
    renderLines = true,
    renderDot = false,
    renderToolTip = true,
    renderXaxis = true,
    renderYaxis = true,
    smoothStroke = true,
    xaxisInterval = 0
}: {
    chartData?: ILineChartData[];
    className?: string;
    strokeColor?: string;
    strokeCoverColor?: string;
    fillGradiant?: boolean;
    strokeWidth?: string;
    renderLines?: boolean;
    renderDot?: boolean;
    renderToolTip?: boolean;
    renderXaxis?: boolean;
    renderYaxis?: boolean;
    smoothStroke?: boolean;
    xaxisInterval?: number;
}) {
    const uniqueId = uuidv4(); // Generate a unique ID for this chart instance

    return (
        <ResponsiveContainer width="100%" height="100%" className={className}>
            <AreaChart
                data={chartData || demoCustomLineChartData}
                margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id={`colorUv-${uniqueId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor={strokeCoverColor}
                            stopOpacity={1}
                        />
                        <stop
                            offset="90%"
                            stopColor={strokeCoverColor}
                            stopOpacity={0}
                        />
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
                        allowDecimals={false}
                    />
                )}
                {renderToolTip && (
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ strokeDasharray: 5, stroke: '#1C63E7' }}
                    />
                )}
                <Area
                    type={smoothStroke ? 'monotone' : 'linear'}
                    dataKey="amt"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fillOpacity={1}
                    fill={fillGradiant ? `url(#colorUv-${uniqueId})` : strokeCoverColor}
                    isAnimationActive={false}
                    strokeLinecap="round"
                    dot={renderDot}
                    activeDot={{ r: 8 }}
                />
                {renderXaxis && (
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        dy={5}
                        fill="#2196F3"
                        stroke="#A2A3A5"
                        interval={xaxisInterval}
                    ></XAxis>
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
}
