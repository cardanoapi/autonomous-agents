'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { PATHS } from '@consts';
import { Boxes } from 'lucide-react';

import GovernanceActionIcon from '@app/components/icons/GovernanceActionIcon';
import Logo from '@app/components/icons/Logo';
import SideNavLink from '@app/components/layout/SideNavLink';

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
const LogsIcon = dynamic(() => import('@app/components/icons/LogsIcon'), {
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
    },
    {
        title: 'DRep Directory',
        href: PATHS.dRepDirectory,
        icon: Boxes
    },
    {
        title: 'Governance Actions',
        href: PATHS.governanceActions,
        icon: GovernanceActionIcon
    },
    {
        title: 'History',
        href: '/history',
        icon: LogsIcon
    }
];

export default function SideNav() {
    return (
        <nav className="h-full w-full border-r-[0.5px] bg-white">
            <Link
                href="/"
                className="flex flex-row items-center gap-x-2  py-8 pb-6 pl-4  "
            >
                <Logo height={48} width={48} />
                <div>
                    <span className="h3 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-medium !text-transparent">
                        Autonomous
                    </span>
                    <br />
                    <span className="h2 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-semibold !text-transparent">
                        Agent Testing
                    </span>
                </div>
            </Link>
            <div className=" mt-6 flex flex-col gap-y-4 px-2">
                {SideNavItems.map((Prop, index) => (
                    <SideNavLink key={index} Prop={Prop} />
                ))}
            </div>
        </nav>
    );
}
