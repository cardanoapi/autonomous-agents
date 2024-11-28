import { PATHS } from '@consts';
import { Boxes } from 'lucide-react';

import AgentsIcon from '@app/assets/icons/AgentsIcon';
import DashBoardIcon from '@app/assets/icons/DashboardIcon';
import GovernanceActionIcon from '@app/assets/icons/GovernanceActionIcon';
import LogsIcon from '@app/assets/icons/LogsIcon';
import TemplateIcon from '@app/assets/icons/TemplatesIcon';
import { ISideNavItem } from '@app/components/layout/SideNav/SideNavItem';

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
