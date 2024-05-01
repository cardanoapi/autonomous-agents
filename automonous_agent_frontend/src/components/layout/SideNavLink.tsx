"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/utils';
import { ISideNavItem } from './SideNav';

export default function SideNavLink({ Prop }: { Prop: ISideNavItem }) {
    const currentPath = usePathname();

    const isActive =  (currentPath.includes(Prop.href) && Prop.href.length > 2) || (Prop.href.length === 1 && currentPath === '/');

    return (
        <Link href={Prop.href}>
            <div
                className={cn(
                    'hover-transition-blue mb-4 flex h-10 items-center rounded px-3 ',
                    { 'bg-brand-Blue-100': isActive }
                )}
            >
                <Prop.icon fill={isActive ? "#2196F3" : "#8C8C8C"} />
                <div className={cn("h3 pl-4" , {"text-brand-Blue-200" : isActive})}>{Prop.title}</div>
            </div>
        </Link>
    );
}
