import { Card } from '@app/components/atoms/Card';
import { ArrowUp } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import OverViewCardTitle from './OverViewCardTitle';
import { LineChart } from 'lucide-react';

export interface IOverViewAgentsCard {
    title: string;
    totalTransactions: number | string;
    successPercentage: number | string;
    unsucessPercentage: number | string;
}

export default function OverViewTransactionsCard({
    title,
    totalTransactions,
    successPercentage,
    unsucessPercentage,
}: IOverViewAgentsCard) {
    return (
        <Card className="flex h-full w-full flex-col justify-between gap-y-0 p-4 pb-4 min-w-[269px] hover-transition-primary">
            <OverViewCardTitle title={title} value={totalTransactions} />
            <div className="flex w-full gap-x-4 items-center 4xl:gap-x-12 xl:mb-1">
                <div className="flex items-center gap-x-2">
                    <LineChart stroke='#38CC2B'/>
                    <div className="card-h4 ">{successPercentage} % Successful</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <ArrowDown stroke='#ff3100'/>
                    <div className="card-h4"><span className='#ff3100'></span>{unsucessPercentage} % Failed</div>
                </div>
            </div>
        </Card>
    );
}
