import Link from 'next/link';

import SideNavLink from './SideNavLink';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
}

export default function SideNav({ SideNavItems }: { SideNavItems: ISideNavItem[] }) {
    return (
        <nav className="h-screen w-64 border-r-2 bg-white">
            <Link href="/">
                <div className="border-b-2 pb-4 pl-4 py-5 text-base font-medium text-zinc-800 leading-[24px]">
                    Autonomous
                    <br />
                    Agent
                    <br />
                    Testing
                </div>
            </Link>
            <div className="flex-col ml-1 mt-6 px-[6px]">
                {SideNavItems.map((Prop, index) => (
                    <SideNavLink key={index} Prop={Prop} />
                ))}
            </div>
        </nav>
    );
}
