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

export interface ILineChartData {
    name: string;
    amt: number;
}

const demoData: ILineChartData[] = [
    { name: 'A', amt: 10 },
    { name: 'B', amt: 20 },
    { name: 'C', amt: 24 },
    { name: 'D', amt: 8 },
    { name: 'E', amt: 12 },
    { name: 'F', amt: 32 },
];

export default function CustomLineChart() {
    const [data, setData] = useState<ILineChartData[]>(demoData);
    const [speed , setSpeed] = useState(1500)
    


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
        const interval = setInterval(updateChartData, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
            <ResponsiveContainer width="100%" height="100%" >
                <AreaChart
                    data={data}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                    stackOffset='wiggle'
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0093FD1A" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#FFFFFF00" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip />
                    <CartesianGrid strokeDasharray="0" vertical={false} fillOpacity={0.4}/> 
                    <XAxis tickLine={false} dy={10}>
                    <Label position="insideBottom" value="Hour"/>
                    </XAxis>
                    <YAxis dx={-10} tickCount={4} axisLine={false} tickLine={false}/>
                    <Area
                        type="monotone"
                        dataKey="amt"
                        stroke="#2196F3"
                        strokeWidth={"6"}
                        fillOpacity={1}
                        fill="url(#colorUv)"
                        animationEasing='ease-in-out'
                        className='bg-black'
                        animationDuration={speed}
                        strokeLinecap='round'
                    />
                </AreaChart>
            </ResponsiveContainer>
    );
}