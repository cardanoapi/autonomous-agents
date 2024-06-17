'use client';

import AgentTabItem from './AgentTabItem';

const AgentTabType = ['Overview', 'History', 'Logs'];

const AgentTabSection = () => {
    return (
        <div
            className={
                'flex min-h-full w-[200px] flex-col gap-2 rounded-lg bg-white py-6'
            }
        >
            {AgentTabType.map((item, index) => {
                return <AgentTabItem key={index} item={item} />;
            })}
        </div>
    );
};

export default AgentTabSection;
