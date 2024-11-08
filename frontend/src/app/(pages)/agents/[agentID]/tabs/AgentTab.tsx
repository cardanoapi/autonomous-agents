'use client';

import { useEffect } from 'react';

import { useAtom } from 'jotai';

import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '@app/components/shadcn/lib/utils';
import AgentTabItem from './AgentTabItem';

const adminTabs = ['Overview', 'Functions', 'Manual Actions', 'Logs', 'Settings'];
const normalTabs = ['Overview', 'Functions', 'Logs'];

const AgentTabSection = ({
    showAllTabs = false,
    className
}: {
    showAllTabs?: boolean;
    className?: string;
}) => {
    const tabs = showAllTabs ? adminTabs : normalTabs;

    const [, setSelectedTab] = useAtom(selectedAgentTabAtom);

    useEffect(() => {
        setSelectedTab('Overview');
    }, []);

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
