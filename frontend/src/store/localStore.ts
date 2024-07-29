import { IAgent } from '@api/agents';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { CIP30Instance } from 'kuber-client/types';

interface ICurrentConnectedWallet {
    api: CIP30Instance | null;
    address: string;
    provider: string;
    icon: string;
}

export const agentCreatedAtom = atom(false);

export const templateCreatedAtom = atom(false);

export const agentDeletedAtom = atom(false);

export const templateDeletedAtom = atom(false);

type AgentTabType = 'Overview' | 'History';

export const selectedAgentTabAtom = atom<AgentTabType>('Overview');

export const currentAgentNameAtom = atom('Agent Profile');

export const adminAccessAtom = atomWithStorage<boolean>('adminAccess', false);

export const currentConnectedWalletAtom =
    atomWithStorage<ICurrentConnectedWallet | null>('currentWallet', null);

export const agentWithActiveStatus = atom<Record<string, boolean> | null>(null);

export const agentsAtom = atom<Record<string, IAgent> | null>(null);
