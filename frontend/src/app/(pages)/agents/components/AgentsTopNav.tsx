import Link from 'next/link';

import DataActionBar from '@app/app/components/DataActionBar';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

const AgentsTopNav = ({
    numOfAgents,
    createAgentAccess,
    onSearch = () => {}
}: {
    numOfAgents: number;
    createAgentAccess: boolean;
    onSearch?: any;
}) => {
    return (
        <div className="flex w-full justify-between flex-wrap gap-y-2">
            <div className="flex items-center gap-x-4">
                <DataActionBar
                    placeholder="Search Agent Name"
                    className="h-10 !w-full"
                    onSearch={onSearch}
                ></DataActionBar>
            </div>

            <Link href="/agents/create-agent">
                <Button
                    variant="primary"
                    className={cn(
                        'h-[36px] w-[145px]',
                        createAgentAccess ? '' : '!hidden'
                    )}
                >
                    Create Agent
                </Button>
            </Link>
        </div>
    );
};

const AgentsTopNavSkeleton = () => {
    return (
        <div className="flex justify-between">
            <div className="flex items-center gap-x-4">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-10 min-w-[420px]" />
            </div>
        </div>
    );
};

export default AgentsTopNav;
export { AgentsTopNavSkeleton };
