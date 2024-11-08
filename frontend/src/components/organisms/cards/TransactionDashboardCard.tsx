import { ArrowDown, LineChart } from 'lucide-react';

import DashboardBaseCard from './DashboardBaseCard';

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
    unsucessPercentage
}: IOverViewAgentsCard) {
    return (
        <DashboardBaseCard title={title} value={totalTransactions}>
            <div className="mt-4 flex w-full items-center gap-x-4 xl:mb-1 4xl:gap-x-12">
                <div className="flex items-center gap-x-2">
                    <LineChart stroke="#38CC2B" />
                    <div className="card-h4 ">{successPercentage} % Successful</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <ArrowDown stroke="#ff3100" />
                    <div className="card-h4">
                        <span className="#ff3100"></span>
                        {unsucessPercentage} % Failed
                    </div>
                </div>
            </div>
        </DashboardBaseCard>
    );
}
