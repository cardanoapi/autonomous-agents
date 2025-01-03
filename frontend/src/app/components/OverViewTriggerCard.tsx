import { Cable, CalendarClock } from 'lucide-react';

import { Card } from '@app/components/atoms/Card';

import OverViewCardTitle from './OverViewCardTitle';

export interface IOverViewAgentsCard {
    title: string;
    total: number | string;
    active: number;
    inactive: number | string;
}

export default function OverViewTriggerCard({ title, total, active, inactive }: IOverViewAgentsCard) {
    return (
        <Card className="hover-transition-primary flex h-full w-full min-w-[269px] flex-col justify-between gap-y-0 p-4 pb-6">
            <OverViewCardTitle title={title} value={total} />
            <div className="flex w-full items-center gap-x-10 4xl:gap-x-12">
                <div className="flex items-center gap-x-2">
                    <CalendarClock stroke="#5F00D7" />
                    <div className="card-h4 ">{active} Crons</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <Cable stroke="#5F00D7" />
                    <div className="card-h4">{inactive} Events</div>
                </div>
            </div>
        </Card>
    );
}
