import { Card } from '@app/components/atoms/Card';

import OverViewCardTitle from './OverViewCardTitle';
import { CalendarClock } from 'lucide-react';
import { Cable } from 'lucide-react';

export interface IOverViewAgentsCard {
    title: string;
    total: number | string;
    active: number;
    inactive: number | string;
}

export default function OverViewTriggerCard({
    title,
    total,
    active,
    inactive,
}: IOverViewAgentsCard) {
    return (
        <Card className="flex h-full w-full flex-col justify-between gap-y-0 p-4 pb-6 min-w-[269px] hover-transition-primary">
            <OverViewCardTitle title={title} value={total} />
            <div className="flex w-full gap-x-10 items-center 4xl:gap-x-12">
                <div className="flex items-center gap-x-2">
                   <CalendarClock stroke='#5F00D7'/>
                    <div className="card-h4 ">{active} Crons</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <Cable stroke='#5F00D7'/>
                    <div className="card-h4">{inactive} Events</div>
                </div>
            </div>
        </Card>
    );
}
