import { ITemplate } from '@api/templates';
import { atom } from 'jotai/index';

export const templateAtom = atom<ITemplate | null>(null);
