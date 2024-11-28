'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@app/components/lib/utils';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
    hidden?: boolean;
}

export default function SideNavItem({ Prop , onClick }: { Prop: ISideNavItem , onClick? : any }) {
    const currentPath = usePathname();

    const isActive =
        (currentPath.includes(Prop.href) && Prop.href.length > 2) ||
        (Prop.href.length === 1 && currentPath === '/');

    if (Prop.hidden) {
        return <></>;
    }

    return (
        <Link href={Prop.href} onClick={onClick} className={cn("w-full flex h-10 items-center rounded px-3 overflow-clip" ,{'bg-brand-Blue-100': isActive })}>
                <Prop.icon
                        className={cn(
                            isActive ? 'text-brand-Blue-200' : 'text-gray-500'
                        ,"min-w-4")}
                />
                <span
                    className={cn('text-sm font-medium pl-4 w-full no-wrap-truncate', {
                        'text-brand-Black-100': !isActive,
                        'text-brand-Blue-200': isActive
                    })}
                >
                    {Prop.title}
                </span>
        </Link>
    );
}
