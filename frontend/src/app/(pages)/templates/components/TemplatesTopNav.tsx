import Link from 'next/link';

import DataActionBar from '@app/app/components/DataActionBar';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
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
        <div className="flex justify-between gap-y-2 gap-x-4">
            <div className="flex items-center justify-center ">
                <DataActionBar
                    className="h-10"
                    placeholder="Search Template Name "
                    onSearch={onSearch}
                />
            </div>
            <Link href="/templates/create-template" >
                <Button
                    variant="primary"
                    className={cn('h-[36px] w-[145px]  max-sm:!bg-transparent max-sm:text-brand-Blue-200 max-sm:p-0 max-sm:w-fit', adminAccess ? '' : '!hidden')}
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
