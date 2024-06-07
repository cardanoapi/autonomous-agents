'use client';

import { usePathname } from 'next/navigation';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../atoms/DropDownMenu';

export default function TopNav() {
    const path: string = usePathname();

    const PageTitles: { [key: string]: string } = {
        '/': 'Dashboard',
        '/agents': 'Agents Page',
        '/agents/create-agent': 'Agent Form',
        '/templates': 'Template page',
        '/templates/create-template': 'Template Form'
    };

    return (
        <div className="flex w-[full] items-center justify-between text-sm">
            <span className="h1">{PageTitles[path]}</span>
            <DropdownMenu>
                <DropdownMenuTrigger>Admin</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Privacy</DropdownMenuItem>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
