'use client';

import { usePathname } from 'next/navigation';

import { PATHS } from '@configs';
import { useAtom } from 'jotai';

import { currentAgentNameAtom } from '@app/store/loaclStore';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../atoms/DropDownMenu';

export default function TopNav() {
    const [currentAgentName] = useAtom(currentAgentNameAtom);
    const path: string = usePathname();

    const PageTitles: { [key: string]: string } = {
        '/': 'Dashboard',
        '/agents': 'Agents Page',
        '/agents/create-agent': 'Agent Form',
        '/templates': 'Template page',
        '/templates/create-template': 'Template Form',
        [PATHS.DREP_DIRECTORY]: 'DRep Directory'
    };

    function getPageTitleByRegexMatch() {
        const RegexForAgentIdPage = /^\/agents\/.*$/;
        if (RegexForAgentIdPage.test(path)) {
            return currentAgentName;
        } else {
            return '';
        }
    }

    function getPageTitle() {
        const title = PageTitles[path];
        return title ? title : getPageTitleByRegexMatch();
    }

    return (
        <div className="flex w-[full] items-center justify-between text-sm">
            <span className="h1">{getPageTitle()}</span>
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
