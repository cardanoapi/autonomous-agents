import React from 'react';

import { atom, useAtom } from 'jotai';

const dialogAtom = atom<boolean>(false);

export function useAppDialog() {
    const [isDialogOpen, setDialogOpen] = useAtom(dialogAtom);

    const openDialog = () => {
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };

    return { isDialogOpen, openDialog, closeDialog, setDialogOpen };
}
