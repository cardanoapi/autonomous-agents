import { TriangleAlert } from 'lucide-react';

import { cn } from '@app/components/lib/utils';

export default function EmptyGovActionPlaceholder({ className }: { className?: string }) {
    return (
        <div className={cn('border-Gray-200 flex h-full w-full items-center justify-center rounded-lg', className)}>
            <div className="flex items-center gap-2">
                <TriangleAlert className="h-10 w-10 text-gray-400" />
                <span className="h2 !text-gray-400">No Gov Actions found at the moment!</span>
            </div>
        </div>
    );
}
