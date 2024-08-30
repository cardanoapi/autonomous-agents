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
    xaxisTick?: string;
    toolTipFooter?: React.ReactNode;
}

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
    xaxisInterval = 0,
    showOnlyTransaction = false,
    positionYToolTip,
    positionXToolTip
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
    showOnlyTransaction?: boolean;
    positionYToolTip?: number;
    positionXToolTip?: number;
}) {
    const uniqueId = uuidv4(); // Generate a unique ID for this chart instance

    return (
        <ResponsiveContainer>
            <AreaChart data={chartData} className={className}>
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
                        content={
                            <CustomTooltip showOnlyTransaction={showOnlyTransaction} />
                        }
                        cursor={{ strokeDasharray: 5, stroke: '#1C63E7' }}
                        position={{ y: positionYToolTip, x: positionXToolTip }}
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
                        dataKey={'xaxisTick'}
                        tickLine={false}
                        dy={5}
                        fill="#2196F3"
                        stroke="#A2A3A5"
                        interval={xaxisInterval}
                        reversed={true}
                    ></XAxis>
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
}
