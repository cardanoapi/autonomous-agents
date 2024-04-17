'use client';

import { usePathname } from 'next/navigation';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../atoms/DropDownMenu';
import { Label } from '../atoms/label';

export default function TopNav() {
    const path: string = usePathname();

    const PageTitles : {[key:string] : string} = {
        '/': 'Dashboard',
        '/agents': 'Agents',
        '/create-agent': 'Agent Form',
        '/templates' : 'Template Form'
    };

    return (
        <div className="flex w-[full] items-center justify-between text-sm">
            <Label className='text-[20px] font-[600]'>{PageTitles[path]}</Label>
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
