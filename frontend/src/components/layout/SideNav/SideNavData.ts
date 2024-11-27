import { ISideNavItem } from '@app/components/layout/SideNav/SideNavItem';
import DashBoardIcon from '@app/assets/icons/DashboardIcon';
import AgentsIcon from '@app/assets/icons/AgentsIcon';
import TemplateIcon from '@app/assets/icons/TemplatesIcon';
import { PATHS } from '@consts';
import { Boxes } from 'lucide-react';
import GovernanceActionIcon from '@app/assets/icons/GovernanceActionIcon';
import LogsIcon from '@app/assets/icons/LogsIcon';

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