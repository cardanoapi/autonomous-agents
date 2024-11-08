import React from 'react';

import { Card } from '@app/components/molecules/Card';
import { cn } from '@app/components/shadcn/lib/utils';

export interface IDashboardBaseCard {
    title?: string;
    value?: number | string;
    children?: React.ReactNode;
    className?: string;
}

const DashboardBaseCard: React.FC<IDashboardBaseCard> = ({
    title,
    value,
    children,
    className
}) => {
    return (
        <Card
            className={cn(
                'hover-transition-primary flex h-full w-full min-w-[269px] flex-col justify-between gap-y-0 p-4 pb-6',
                className
            )}
        >
            <div className="flex flex-col gap-y-2">
                <div className="h4">{title}</div>
                <div className="card-h1 pl-[2px]">{value}</div>
            </div>
            {children}
        </Card>
    );
};

export default DashboardBaseCard;
