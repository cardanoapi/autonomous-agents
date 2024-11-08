import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import CustomLineChart , {ILineChartData} from '../chart/CustomLineChart';
import { cn } from '@app/components/shadcn/lib/utils';

import DashboardBaseCard from './DashboardBaseCard';

export interface IOverViewTemplatesCard {
    title: string;
    totalValue: number;
    changeRate: number;
    graphData?: ILineChartData[];
    theme?: string;
}

export default function OverViewGraphCard({
    title,
    totalValue,
    changeRate,
    graphData = [],
    theme = 'Primary'
}: IOverViewTemplatesCard) {
    const isNeutral = changeRate === 0;
    const iconColor = isNeutral
        ? '#B0B0B0'
        : theme === 'Primary'
          ? '#FF660F'
          : '#007900';
    const textColor = isNeutral
        ? 'text-gray-500'
        : theme === 'Primary'
          ? 'text-brand-Orange-200'
          : 'text-brand-Green-200';
    const bgColor = isNeutral
        ? 'bg-gray-200'
        : theme === 'Primary'
          ? 'bg-brand-Orange-100'
          : 'bg-brand-Green-100';

    return (
        <DashboardBaseCard title={title} value={totalValue}>
            <div className="relative flex w-full items-center">
                <div className="b flex items-end gap-x-1">
                    <div className={cn('rounded-full p-1', bgColor)}>
                        {changeRate > 0 ? (
                            <ArrowUp stroke={iconColor} size={20} />
                        ) : changeRate === 0 ? (
                            <Minus stroke={iconColor} size={20} />
                        ) : (
                            <ArrowDown stroke={iconColor} size={20} />
                        )}
                    </div>
                    <span className={cn('h4 text-pretty', textColor)}>
                        {changeRate} %{' '}
                        <span className="hidden text-xs xl:inline">(24 hours)</span>
                    </span>
                </div>
                <div className="3xl:w-30 absolute bottom-0 right-0 flex h-24 w-28 items-center gap-x-1 pr-4  pt-6 3xl:h-28 4xl:h-32 4xl:w-40 ">
                    <CustomLineChart
                        chartData={graphData}
                        renderLines={false}
                        renderXaxis={false}
                        renderYaxis={false}
                        renderDot={false}
                        renderToolTip={false}
                        strokeColor={theme === 'Primary' ? '#FF660F' : '#5F00D7'}
                        strokeWidth="1"
                        smoothStroke={false}
                        fillGradiant={false}
                        strokeCoverColor={theme === 'Primary' ? '#FFECD4' : '#F8E8F8'}
                    />
                </div>
            </div>
        </DashboardBaseCard>
    );
}
