'use client';

import { useEffect } from 'react';

import { useAtom } from 'jotai';

import { selectedAgentTabAtom } from '@app/store/localStore';

import { cn } from '../../lib/utils';
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
        <>
            <div
                className={cn('flex md:flex-col gap-2 rounded-lg md:bg-white md:py-6 p-1', className)}
            >
                {tabs.map((item, index) => (
                    <AgentTabItem key={index} item={item} />
                ))}
            </div>
        </>
    );
};

export default AgentTabSection;
