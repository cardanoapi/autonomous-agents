'use client';

import React from 'react';

import { Dialog, DialogContent } from '../shadcn/dialog';
import AgentManualTriggerModalView from './ModalViews/AgentManualTriggerModalView';
import AgentRunnerModalView from './ModalViews/AgentRunnerView';
import { ModalViewType, useModal } from './context';

function getRenderComponent(view: ModalViewType, modalProps?: any) {
    switch (view) {
        case 'AgentManualTriggerView':
            return <AgentManualTriggerModalView {...modalProps} />;
        case 'AgentRunnerView':
            return <AgentRunnerModalView {...modalProps} />;
        default:
            return <></>;
    }
}

function getClassName(view: ModalViewType) {
    switch (view) {
        case 'AgentManualTriggerView':
        case 'AgentRunnerView':
            return 'w-full md:!min-w-[600px]';
        default:
            return <></>;
    }
}

const ModalContainer = () => {
    const { isOpen, view, modalProps, closeModal } = useModal();
    return (
        <Dialog open={isOpen} onOpenChange={() => closeModal()}>
            <DialogContent
                className={`max-w-none bg-red-50 !p-0 ${getClassName(view)} w-fit`}
                onClickCloseIcon={() => closeModal()}
            >
                {getRenderComponent(view, modalProps)}
            </DialogContent>
        </Dialog>
    );
};

export default ModalContainer;
