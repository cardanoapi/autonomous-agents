'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import Logo from './Logo';
import SideNavLink from './SideNavLink';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
}

const AgentsIcon = dynamic(() => import('@app/components/icons/AgentsIcon'), {
    ssr: false
});
const DashBoardIcon = dynamic(() => import('@app/components/icons/DashboardIcon'), {
    ssr: false
});
const TemplateIcon = dynamic(() => import('@app/components/icons/TemplatesIcon'), {
    ssr: false
});

const SideNavItems: ISideNavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: DashBoardIcon
    },
    {
        title: 'Agents',
        href: '/agents',
        icon: AgentsIcon
    },
    {
        title: 'Templates',
        href: '/templates',
        icon: TemplateIcon
    }
];

export default function SideNav() {
    return (
        <nav className="min-h-screen w-full border-r-2 bg-white">
            <Link
                href="/"
                className="flex flex-row items-center gap-x-2 border-b-2 py-5 pb-6 pl-4 pt-6 "
            >
                <Logo />
                <div className="h3 text-brand-Blue-200">
                    Autonomous
                    <br />
                    Agent
                    <br />
                    Testing
                </div>
            </Link>
            <div className="ml-1 mt-6 flex-col px-2">
                {SideNavItems.map((Prop, index) => (
                    <SideNavLink key={index} Prop={Prop} />
                ))}
            </div>
        </nav>
    );
}
