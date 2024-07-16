'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { SendLogoutRequest } from '@api/auth';
import { PATHS } from '@consts';
import { useAtom } from 'jotai';

import { currentAgentNameAtom, walletApiAtom } from '@app/store/loaclStore';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../atoms/DropDownMenu';
import { SuccessToast } from '../molecules/CustomToasts';

export default function TopNav() {
    const [currentAgentName] = useAtom(currentAgentNameAtom);
    const path: string = usePathname();

    const router = useRouter();

    const [, setWalletApiAtom] = useAtom(walletApiAtom);

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

    function handleLogout() {
        localStorage.removeItem('wallet');
        setWalletApiAtom(null);
        router.push('/');
        SuccessToast('User Logged out successfully');
        SendLogoutRequest();
    }

    return (
        <div className="flex w-[full] items-center justify-between text-sm">
            <span className="h1">{getPageTitle()}</span>
            <DropdownMenu>
                <DropdownMenuTrigger>Admin</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Privacy</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
