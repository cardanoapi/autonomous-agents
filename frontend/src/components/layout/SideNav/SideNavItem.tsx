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

export default function SideNavItem({
    Prop,
    onClick
}: {
    Prop: ISideNavItem;
    onClick?: any;
}) {
    const currentPath = usePathname();

    const isActive =
        (currentPath.includes(Prop.href) && Prop.href.length > 2) ||
        (Prop.href.length === 1 && currentPath === '/');

    if (Prop.hidden) {
        return <></>;
    }

    return (
        <Link
            href={Prop.href}
            onClick={onClick}
            className={cn(
                'flex h-10 w-full items-center overflow-clip rounded px-3 transition-all duration-300 ease-in-out',
                { 'bg-brand-Blue-100': isActive }
            )}
        >
            <Prop.icon
                className={cn(
                    isActive ? 'text-brand-Blue-200' : 'text-gray-500',
                    'min-w-4'
                )}
            />
            <span
                className={cn(
                    'no-wrap-truncate w-full pl-4 text-sm font-medium max-md:text-lg',
                    {
                        'text-brand-Black-100': !isActive,
                        'text-brand-Blue-200': isActive
                    }
                )}
            >
                {Prop.title}
            </span>
        </Link>
    );
}
