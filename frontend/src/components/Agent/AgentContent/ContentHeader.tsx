import React from 'react';

import { cn } from '@app/components/lib/utils';

export default function ContentHeader({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mb-8 w-full items-center bg-brand-White-100', className)}>
            {children}
        </div>
    );
}
