import React from 'react';

import { cn } from '@app/components/lib/utils';

interface TypographyH2Props {
    className?: string;
    children: React.ReactNode;
}

export function TypographyH2({ className, children }: TypographyH2Props) {
    return <h2 className={cn('font-semibold', className)}>{children}</h2>;
}
