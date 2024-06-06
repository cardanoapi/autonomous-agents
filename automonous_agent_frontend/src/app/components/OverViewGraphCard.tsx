import { ArrowDown, ArrowUp, FileText } from 'lucide-react';
import { FileCog } from 'lucide-react';

import { Card } from '@app/components/atoms/Card';
import CustomLineChart, {
    ILineChartData
} from '@app/components/molecules/chart/CustomLineChart';

import OverViewCard from './OverViewCard';
import { cn } from '@app/components/lib/utils';

export interface IOverViewTemplatesCard {
    title: string;
    totalValue : number
    changeRate : number
    graphData?: ILineChartData[];
    theme? : string
}

export const demoGraphData: ILineChartData[] = [
    {
        name: 'a',
        amt: 0
    },
    {
        name: 'b',
        amt: 5
    },
    {
        name : 'c',
        amt : 12,
    },
    {
        name : 'd',
        amt : 11,
    },
    {
        name: 'e',
        amt: 7
    }
];

export default function OverViewGraphCard({
    title,
    totalValue,
    changeRate,
    graphData = demoGraphData,
    theme = "Primary"
}: IOverViewTemplatesCard) {
    return (
        <OverViewCard title={title} value={totalValue}>
            <div className="flex w-full items-center gap-x-12 4xl:gap-x-12 relative">
                <div className="flex items-center gap-x-1">
                    <div className={cn("rounded-full p-1" , theme === "Primary" ? "bg-brand-Orange-100" : "bg-brand-Green-100")}>
                        {changeRate > 0 ? (
                            <ArrowUp stroke={cn(theme === "Primary" ? "#FF660F" : "#007900" )} size={20} />
                        ) :  (
                            <ArrowDown stroke={cn(theme === "Primary" ? "#FF660F" : "#007900" )} size={20} />
                        )}
                    </div>
                    <span className={cn("h4" , theme === "Primary" ? "text-brand-Orange-200" : "text-brand-Green-200")}>
                        {changeRate} %
                    </span>
                </div>
                <div className="absolute flex h-28 w-28 items-center gap-x-1 bottom-0 right-0">
                    <CustomLineChart
                        chartData={graphData}
                        renderLines={false}
                        renderXaxis={false}
                        renderYaxis={false}
                        renderDot={false}
                        renderToolTip={false}
                        strokeColor= {theme === "Primary" ? "#FF660F" : "#5F00D7"}
                        strokeWidth="2"
                        smoothStroke={false}
                        fillGradiant={false}
                        strokeCoverColor= {theme === "Primary" ? "#FFECD4" : "#F8E8F8"}
                    />
                </div>
            </div>
        </OverViewCard>
    );
}
