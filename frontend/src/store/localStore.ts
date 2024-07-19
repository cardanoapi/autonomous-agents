import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { CIP30Instance } from 'kuber-client/types';

export const agentCreatedAtom = atom(false);

export const templateCreatedAtom = atom(false);

export const agentDeletedAtom = atom(false);

export const templateDeletedAtom = atom(false);

type AgentTabType = 'Overview' | 'History';

export const selectedAgentTabAtom = atom<AgentTabType>('Overview');

export const currentAgentNameAtom = atom('Agent Profile');

export const walletApiAtom = atom<CIP30Instance | null>(null);

export const walletStakeAddressAtom = atom<string | null>(null);

export const adminAccessAtom = atomWithStorage<boolean>('adminAccess', false);
