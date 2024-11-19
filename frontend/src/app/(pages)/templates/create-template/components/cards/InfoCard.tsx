import { Info } from 'lucide-react';

import { cn } from '@app/components/lib/utils';

export default function InfoCard({
    onMouseEnter,
    onMouseLeave,
    visible
}: {
    onMouseEnter: any;
    onMouseLeave: any;
    visible: boolean;
}) {
    return (
        <div className="group relative  mb-2 flex self-end">
            <Info
                className="hover:text-gray-400"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
            <span
                className={cn(
                    'absolute left-10 top-4 hidden w-64 rounded bg-gray-100 p-4 shadow transition-opacity duration-200',
                    { flex: visible }
                )}
            >
                Create different relations between event and their paramaters
                <br />
                <br />
                For complex relations you can edit the trigger via json mode.
            </span>
        </div>
    );
}
