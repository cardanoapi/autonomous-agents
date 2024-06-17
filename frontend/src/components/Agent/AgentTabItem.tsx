'use client';

import { useAtom } from 'jotai/index';

import { cn } from '@app/components/lib/utils';
import { selectedAgentTabAtom } from '@app/store/loaclStore';

const AgentTabItem = ({ item }: { item: any }) => {
    const [selectedTab, setSelectedTab] = useAtom(selectedAgentTabAtom);
    return (
        <div
            onClick={() => setSelectedTab(item)}
            className={cn(
                'cursor-pointer rounded p-2 px-4 text-brand-Black-100',
                selectedTab === item
                    ? ' bg-brand-Blue-100 text-blue-500'
                    : 'hover-transition-blue !text-brand-Black-100'
            )}
        >
            {item}
        </div>
    );
};

export default AgentTabItem;
