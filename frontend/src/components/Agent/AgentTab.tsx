'use client';

import AgentTabItem from './AgentTabItem';

const adminTabs = [
    'Overview',
    'History',
    'Logs',
    'Manual Trigger',
    'Agent Runner'
];
const normalTabs = ['Overview', 'History', 'Logs'];

const AgentTabSection = ({ showAllTabs = false }: { showAllTabs?: boolean }) => {
    const tabs = showAllTabs ? adminTabs : normalTabs;

    return (
        <div className="flex min-h-full min-w-[200px] flex-col gap-2 rounded-lg bg-white py-6">
            {tabs.map((item, index) => (
                <AgentTabItem key={index} item={item} />
            ))}
        </div>
    );
};

export default AgentTabSection;
