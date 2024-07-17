'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/utils';
import { ISideNavItem } from './SideNav';

export default function SideNavLink({ Prop }: { Prop: ISideNavItem }) {
    const currentPath = usePathname();

    const isActive =
        (currentPath.includes(Prop.href) && Prop.href.length > 2) ||
        (Prop.href.length === 1 && currentPath === '/');

    return (
        <Link href={Prop.href}>
            <div
                className={cn(
                    'hover-transition-blue flex h-10 items-center rounded px-3',
                    { 'bg-brand-Blue-100': isActive }
                )}
            >
                <div className="w-[10%]">
                    <Prop.icon
                        className={cn(
                            isActive ? 'text-brand-Blue-200' : 'text-gray-500'
                        )}
                    />
                </div>
                <div
                    className={cn('h3 pl-4', {
                        'text-brand-Black-100': !isActive,
                        'text-brand-Blue-200': isActive
                    })}
                >
                    {Prop.title}
                </div>
            </div>
        </Link>
    );
}
