import { Card } from '@app/components/atoms/Card';
import { ArrowUp } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import OverViewCardTitle from './OverViewCardTitle';
import { LineChart } from 'lucide-react';
import OverViewCard from './OverViewCard';

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
        <OverViewCard title={title} value={totalTransactions}>
            <div className="flex w-full gap-x-4 items-center 4xl:gap-x-12 xl:mb-1 mt-4">
                <div className="flex items-center gap-x-2">
                    <LineChart stroke='#38CC2B'/>
                    <div className="card-h4 ">{successPercentage} % Successful</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <ArrowDown stroke='#ff3100'/>
                    <div className="card-h4"><span className='#ff3100'></span>{unsucessPercentage} % Failed</div>
                </div>
            </div>
        </OverViewCard>

    );
}
