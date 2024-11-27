'use client';

import { useAtom } from 'jotai/index';

import { cn } from '@app/components/lib/utils';
import { selectedAgentTabAtom } from '@app/store/localStore';

const AgentTabItem = ({ item }: { item: any }) => {
    const [selectedTab, setSelectedTab] = useAtom(selectedAgentTabAtom);
    return (
        <div
            onClick={() => setSelectedTab(item)}
            className={cn(
                'relative flex cursor-pointer items-center md:gap-2 rounded p-2 md:px-4 gap-1  text-brand-Black-100 text-xs md:text-base',
                selectedTab === item
                    ? ' text-brand-Blue-200'
                    : 'hover-transition-blue !text-brand-Black-100'
            )}
        >
            {selectedTab === item && (
                <div className="absolute left-0 h-[60%] w-[6px] bg-brand-Blue-200 hidden md:flex"></div>
            )}
            {item}
        </div>
    );
};

export default AgentTabItem;
