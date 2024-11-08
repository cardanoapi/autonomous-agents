import Link from 'next/link';

import { Button } from '@app/components/atoms/Button';
import DataActionBar from '@app/components/molecules/DataActionBar';
import { cn } from '@app/components/shadcn/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

const TemplatesTopNav = ({
    templatesCount,
    onSearch,
    adminAccess
}: {
    onSearch: any;
    templatesCount: number;
    adminAccess: boolean;
}) => {
    return (
        <div className="flex justify-between">
            <div className="flex items-center justify-center gap-x-4">
                <span className="text-lg  font-medium">
                    Templates({templatesCount})
                </span>
                <DataActionBar
                    className="h-10 min-w-[420px]"
                    placeholder="Search Template Name "
                    onSearch={onSearch}
                />
            </div>
            <Link href="/templates/create-template">
                <Button
                    variant="primary"
                    className={cn('h-[36px] w-[145px]', adminAccess ? '' : '!hidden')}
                >
                    Create Template
                </Button>
            </Link>
        </div>
    );
};

export const TemplatesTopNavSkeleton = () => {
    return (
        <div className="flex justify-between ">
            <div className="flex items-center gap-x-4">
                <Skeleton className="h-8 w-[140px]" />
                <Skeleton className="h-10 min-w-[420px]" />
            </div>
        </div>
    );
};

export default TemplatesTopNav;
