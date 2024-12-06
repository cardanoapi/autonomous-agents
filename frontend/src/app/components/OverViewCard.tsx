import React from 'react';

import { Card } from '@app/components/atoms/Card';
import { cn } from '@app/components/lib/utils';

export interface IOverViewCard {
    title?: string;
    value?: number | string;
    children?: React.ReactNode;
    className?: string;
}

const OverViewCard: React.FC<IOverViewCard> = ({
    title,
    value,
    children,
    className
}) => {
    return (
        <Card
            className={cn(
                'hover-transition-primary min-gap-y-2 flex h-full w-full flex-col justify-between gap-y-2 p-4 pb-6',
                className
            )}
        >
            <div className="flex flex-col gap-y-2">
                <div className="h4">{title}</div>
                <div className="card-h1 pl-[2px]">{value}</div>
            </div>
            <div>{children}</div>
        </Card>
    );
};

export default OverViewCard;
