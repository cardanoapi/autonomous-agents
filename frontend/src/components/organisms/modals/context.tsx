'use client';

import { atom, useAtom } from 'jotai';

export type ModalViewType = 'AgentManualTriggerView' | 'AgentRunnerView' | '';

interface IModalViewProps {
    isOpen: boolean;
    modalProps?: any;
    view: ModalViewType;
}

const modalViewAtom = atom<IModalViewProps>({
    isOpen: false,
    modalProps: null,
    view: ''
});

export function useModal() {
    const [modalState, setModalState] = useAtom(modalViewAtom);
    const openModal = (view: ModalViewType, modalProps?: any) => {
        setModalState({
            ...modalState,
            isOpen: true,
            modalProps,
            view
        });
    };
    const closeModal = () => {
        setModalState({
            ...modalState,
            isOpen: false,
            view: '',
            modalProps: null
        });
    };

    return { ...modalState, openModal, closeModal };
}
