import { ISideNavItem } from '@app/components/layout/SideNav/SideNavItem';
import DashBoardIcon from '@app/components/icons/DashboardIcon';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import TemplateIcon from '@app/components/icons/TemplatesIcon';
import { PATHS } from '@consts';
import { Boxes } from 'lucide-react';
import GovernanceActionIcon from '@app/components/icons/GovernanceActionIcon';
import LogsIcon from '@app/components/icons/LogsIcon';

export const SideNavItems: ISideNavItem[] = [
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
        title: 'Logs',
        href: '/logs',
        icon: LogsIcon
    }
];