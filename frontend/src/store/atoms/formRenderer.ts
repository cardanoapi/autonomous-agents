import { IFunctionsItem } from '@models/types/functions';
import { atom } from 'jotai';

export const errorAtom = atom<Array<number>>([]);
export const selectedFunctionAtom = atom<IFunctionsItem | null>(null);

export const errorMessageAtom = atom<Array<Record<string, string>>>([]);
