import { atom } from 'jotai';

export const agentCreatedAtom = atom(false);

export const templateCreatedAtom = atom(false);

export const agentDeletedAtom = atom(false);

export const templateDeletedAtom = atom(false);

type AgentTabType = 'Overview' | 'History';

export const selectedAgentTabAtom = atom<AgentTabType>('Overview');
