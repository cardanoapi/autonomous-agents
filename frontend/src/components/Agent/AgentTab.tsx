'use client';

import AgentTabItem from './AgentTabItem';

const adminAgentTabType = [
    'Overview',
    'History',
    'Logs',
    'Manual Trigger',
    'Agent Runner'
];
const normalAgentTabType = ['Overview', 'History', 'Logs'];

const AgentTabSection = ({ enableEdit = false }: { enableEdit?: boolean }) => {
    const tabs = enableEdit ? adminAgentTabType : normalAgentTabType;

    return (
        <div className="flex min-h-full min-w-[200px] flex-col gap-2 rounded-lg bg-white py-6">
            {tabs.map((item, index) => (
                <AgentTabItem key={index} item={item} />
            ))}
        </div>
    );
};

export default AgentTabSection;
