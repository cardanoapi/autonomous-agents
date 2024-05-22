'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import Logo from '../icons/Logo';
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
        <nav className="h-full w-full border-r-[0.5px] bg-white">
            <Link
                href="/"
                className="flex flex-row items-center gap-x-2  pb-6 pl-4 py-8  "
            >
                <Logo height={48} width={48}/>
                <div>
                 <span className='h3 !font-medium !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !text-transparent'>
                    Autonomous
                 </span>
                    <br />
                    <span className='h2 !font-semibold !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !text-transparent'>
                    Agent Testing
                    </span>
                </div>
            </Link>
            <div className=" mt-6 flex-col px-2">
                {SideNavItems.map((Prop, index) => (
                    <SideNavLink key={index} Prop={Prop} />
                ))}
            </div>
        </nav>
    );
}
