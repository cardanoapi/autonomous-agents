'use client';

import { useAtom } from 'jotai/index';

import { cn } from '@app/components/shadcn/lib/utils';
import { selectedAgentTabAtom } from '@app/store/localStore';

const AgentTabItem = ({ item }: { item: any }) => {
    const [selectedTab, setSelectedTab] = useAtom(selectedAgentTabAtom);
    return (
        <div
            onClick={() => setSelectedTab(item)}
            className={cn(
                'relative flex cursor-pointer items-center gap-2 rounded p-2 px-4 text-brand-Black-100',
                selectedTab === item
                    ? ' text-brand-Blue-200'
                    : 'hover-transition-blue !text-brand-Black-100'
            )}
        >
            {selectedTab === item && (
                <div className="absolute left-0 h-[60%] w-[6px] bg-brand-Blue-200 "></div>
            )}
            {item}
        </div>
    );
};

export default AgentTabItem;
