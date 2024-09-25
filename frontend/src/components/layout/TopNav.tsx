'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { IAgent, fetchAgents } from '@api/agents';
import { PATHS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import AgentAvatar from '@app/components/Agent/AgentAvatar';
import {
    adminAccessAtom,
    agentsAtom,
    currentAgentNameAtom
} from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';

export default function TopNav() {
    const [currentAgentName] = useAtom(currentAgentNameAtom);
    const [adminAcesss] = useAtom(adminAccessAtom);
    const [, setAgents] = useAtom(agentsAtom);
    const path: string = usePathname();

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

    if (getPageTitle() === currentAgentName) {
        agentId = path.split('/')[2];
    }

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
            {getPageTitle() === currentAgentName ? (
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
            ) : (
                <span className="h1">{getPageTitle()}</span>
            )}
            {adminAcesss && 'Admin'}
        </div>
    );
}
