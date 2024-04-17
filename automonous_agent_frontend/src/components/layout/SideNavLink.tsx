
import Link from 'next/link';

import { ISideNavItem } from './SideNav';

export default function SideNavLink({ Prop }: { Prop: ISideNavItem }) {
    return (
        <Link href={Prop.href}>
            <div className="mb-4 pl-3 flex h-10 w-full items-center rounded-[4px] px-2 hover:bg-sky-100 hover:text-sky-500 hover:transition-all ">
                <Prop.icon />
                <div className="pl-4 text-sm font-medium">{Prop.title}</div>
            </div>
        </Link>
    );
}
