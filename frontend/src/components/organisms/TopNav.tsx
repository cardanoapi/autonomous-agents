'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { IAgent, fetchAgents } from '@api/agents';
import { PATHS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { templateAtom } from '@app/store/atoms/template';
import {
    adminAccessAtom,
    agentsAtom,
    currentAgentNameAtom
} from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';
import AgentAvatar from '../molecules/AgentAvatar';

export default function TopNav() {
    const [currentAgentName] = useAtom(currentAgentNameAtom);
    const [adminAcesss] = useAtom(adminAccessAtom);
    const [, setAgents] = useAtom(agentsAtom);
    const path: string = usePathname();
    const [template] = useAtom(templateAtom);

    const { data: agents } = useQuery<IAgent[]>({
        queryKey: ['agents'],
        queryFn: async () =>
            fetchAgents({
                page: 1,
                size: 100,
                search: ''
            }),
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
        refetchInterval: 5000,
        refetchIntervalInBackground: true
    });

    useEffect(() => {
        if (agents) {
            const filteredAgents = agents.map((agent: IAgent) => {
                return [agent.id, agent];
            });
            setAgents(Object.fromEntries(filteredAgents));
        }
    }, [agents]);

    let agentId = '';

    const PageTitles: { [key: string]: string } = {
        '/': 'Dashboard',
        '/agents': 'Agents Directory',
        '/agents/create-agent': 'Agent Form',
        '/templates': 'Templates Directory',
        '/templates/create-template': 'Template Form',
        [PATHS.dRepDirectory]: 'DRep Directory',
        [PATHS.governanceActions]: 'Governance Actions',
        '/logs': 'Agents Log History'
    };

    if (getPageTitleByRegexMatch('agents')) {
        agentId = path.split('/')[2];
    }

    function getPageTitleByRegexMatch(pageTitle: string) {
        const RegexForAgentIdPage = new RegExp(`^\/${pageTitle}\/.*$`);
        return RegexForAgentIdPage.test(path);
    }

    function renderTopNavSection() {
        const title = PageTitles[path];
        if (title) {
            return <span className="h1">{title}</span>;
        } else {
            if (getPageTitleByRegexMatch('agents')) {
                return (
                    <div className={'flex items-center gap-3 py-3'}>
                        <AgentAvatar
                            hash={agentId}
                            size={40}
                            isActive={
                                (agents &&
                                    agents.find((item) => item.id === agentId)
                                        ?.is_active) ||
                                false
                            }
                        />
                        <div className="card-h2">{Truncate(currentAgentName, 20)}</div>
                    </div>
                );
            } else if (getPageTitleByRegexMatch('templates')) {
                return <span className="h1">{template?.name}</span>;
            } else {
                return <Skeleton className="h-8 w-[140px]" />;
            }
        }
    }

    if (
        !template?.name &&
        getPageTitleByRegexMatch('templates') &&
        path !== '/templates/create-template'
    ) {
        return <Skeleton className="h-8 w-[140px]" />;
    }

    return (
        <div className="flex w-[full] items-center justify-between text-sm">
            {renderTopNavSection()}
            {adminAcesss && 'Admin'}
        </div>
    );
}
