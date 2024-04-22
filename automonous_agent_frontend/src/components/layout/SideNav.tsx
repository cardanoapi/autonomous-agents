import Link from 'next/link';

import SideNavLink from './SideNavLink';
import Logo from './Logo';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
}

export default function SideNav({ SideNavItems }: { SideNavItems: ISideNavItem[] }) {
    return (
        <nav className="min-h-screen w-64 border-r-2 bg-white">
            <Link href="/" className='flex flex-row items-center py-5 pb-6 pt-6 pl-4 border-b-2 gap-x-2'>
                <Logo />
                <div className="text-[13px] font-semibold leading-[17px] text-brand-Blue-200">
                    Autonomous 
                    <br />
                    Agent
                    <br />
                    Testing
                </div>
            </Link>
            <div className="ml-1 mt-6 flex-col px-[6px]">
                {SideNavItems.map((Prop, index) => (
                    <SideNavLink key={index} Prop={Prop} />
                ))}
            </div>
        </nav>
    );
}
