import Link from 'next/link';

import { ISideNavItem } from './SideNav';

export default function SideNavLink({ Prop }: { Prop: ISideNavItem }) {
    return (
        <Link href={Prop.href}>
            <div className="mb-4 flex h-10 items-center rounded px-3 hover-transition-blue ">
                <Prop.icon />
                <div className="h3 pl-4">{Prop.title}</div>
            </div>
        </Link>
    );
}
