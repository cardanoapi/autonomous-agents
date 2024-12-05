import { cn } from '@app/components/lib/utils';
import React from 'react';

export default function ContentHeader({ children , className }: { children: React.ReactNode , className?: string }) {
    return (
        <div className={cn("w-full items-center bg-brand-White-100 mb-8",className)}>
            {children}
        </div>
    );
}
