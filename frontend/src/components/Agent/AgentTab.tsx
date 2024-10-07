'use client';

import { cn } from '../lib/utils';
import AgentTabItem from './AgentTabItem';

const adminTabs = ['Overview', 'Functions', 'Logs', 'Manual Actions', 'Settings'];
const normalTabs = ['Overview', 'Functions', 'Logs'];

const AgentTabSection = ({
    showAllTabs = false,
    className
}: {
    showAllTabs?: boolean;
    className?: string;
}) => {
    const tabs = showAllTabs ? adminTabs : normalTabs;

    return (
        <div
            className={cn('flex  flex-col gap-2 rounded-lg bg-white py-6 ', className)}
        >
            {tabs.map((item, index) => (
                <AgentTabItem key={index} item={item} />
            ))}
        </div>
    );
};

export default AgentTabSection;
