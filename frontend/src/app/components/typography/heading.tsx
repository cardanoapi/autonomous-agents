import React from 'react';

import { cn } from '@app/components/lib/utils';

interface TypographyHeadingProps {
    className?: string;
    children: React.ReactNode;
}

export function TypographyHeading({ className, children }: TypographyHeadingProps) {
    return <h2 className={cn('text-xl font-medium', className)}>{children}</h2>;
}
