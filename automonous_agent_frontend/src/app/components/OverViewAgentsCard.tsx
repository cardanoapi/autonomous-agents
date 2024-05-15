import { Card } from '@app/components/atoms/Card';

import OverViewCardTitle from './OverViewCardTitle';

export interface IOverViewAgentsCard {
    title: string;
    totalAgents: number | string;
    activeAgents: number;
    inactiveAgents: number;
}

export default function OverViewAgentsCard({
    title,
    totalAgents,
    activeAgents,
    inactiveAgents
}: IOverViewAgentsCard) {
    return (
        <Card className="flex h-full w-full flex-col justify-between gap-y-0 p-4 pb-6">
            <OverViewCardTitle title={title} value={totalAgents} />
            <div className="flex w-full gap-x-8 items-center">
                <div className="flex items-center gap-x-2">
                    <div className="bg-brand-Green-100 flex h-4 w-4  items-center justify-center rounded-full">
                        <div className="bg-brand-Green-200  h-1 w-1 animate-ping rounded-full"></div>
                    </div>
                    <div className="card-h4 ">{activeAgents} Running</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-Inactive-100 opacity-50">
                        <div className="h-2 w-2 rounded-full bg-brand-Gray-200"></div>
                    </div>
                    <div className="card-h4">{inactiveAgents} Inactive</div>
                </div>
            </div>
        </Card>
    );
}
