'use client';

import { usePathname } from 'next/navigation';

import { PATHS } from '@consts';
import { useAtom } from 'jotai';

import { currentAgentNameAtom } from '@app/store/localStore';

export default function TopNav() {
    const [currentAgentName] = useAtom(currentAgentNameAtom);
    const path: string = usePathname();

    const PageTitles: { [key: string]: string } = {
        '/': 'Dashboard',
        '/agents': 'Agents Page',
        '/agents/create-agent': 'Agent Form',
        '/templates': 'Template page',
        '/templates/create-template': 'Template Form',
        [PATHS.dRepDirectory]: 'DRep Directory',
        [PATHS.governanceActions]: 'Governance Actions',
        '/logs': 'Agents Log History'
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
            {/*<DropdownMenu>
                <DropdownMenuTrigger>Admin</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Privacy</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>*/}
            Admin
        </div>
    );
}
