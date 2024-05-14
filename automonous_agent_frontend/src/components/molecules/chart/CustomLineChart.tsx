'use client';

import { useEffect, useState } from 'react';

import { randomInt } from 'crypto';
import {
    Area,
    AreaChart,
    CartesianGrid,
    PolarGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Label
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
    { name :'G', amt: 28},
    { name :'H', amt: 26},
    { name:'I' , amt : 32},
    { name:'J' , amt : 34},
];

export default function CustomLineChart() {
    const [data, setData] = useState<ILineChartData[]>(demoData);
    


    const updateChartData = () => {
        setData((prevData) => {
            const lastData = prevData[prevData.length - 1];
            const newData: ILineChartData = {
                name: ``,
                amt: Math.floor(Math.random() * 30) + 1
            };
            const updatedData = prevData.slice(1);
            return [...updatedData, newData];
        });
    };

     useEffect(() => {
        const interval = setInterval(updateChartData, 30000);
        return () => clearInterval(interval);
    }, []); 

    return (
            <ResponsiveContainer width="100%" height="100%" >
                <AreaChart
                    data={data}
                    margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
                    
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0093FD1A" stopOpacity={1} />
                            <stop offset="95%" stopColor="#0093FD1A" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke='#A2A3A5' strokeOpacity={0.4}/> 
                    <YAxis dx={-10} tickCount={4} axisLine={false} tickLine={false} stroke='#A2A3A5'/>
                    <Tooltip content={<CustomTooltip/>} cursor={{strokeDasharray:5 , stroke:"#2196F3"}}/>
                    <Area
                        type="monotone"
                        dataKey="amt"
                        stroke="#2196F3"
                        strokeWidth={"5"}
                        fillOpacity={1}
                        fill="url(#colorUv)"
                        isAnimationActive={false}
                        strokeLinecap='round'
                        dot={false}
                        activeDot={{r : 8}}
                    />
                    <XAxis tickLine={false} dy={5} fill='#2196F3' stroke='#A2A3A5'>
                    </XAxis>
                </AreaChart>
            </ResponsiveContainer>
    );
}