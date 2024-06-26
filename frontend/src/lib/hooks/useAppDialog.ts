import { useState } from 'react';

export function useAppDialog() {
    const [isOpen, setOpen] = useState(false);

    const toggleDialog = () => {
        setOpen(!isOpen);
    };

    return { isOpen, toggleDialog };
}
