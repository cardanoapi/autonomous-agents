import React, { useState } from 'react';

import { IAgent } from '@api/agents';
import { AvailableFunctions, IFunctionsItem } from '@models/types/functions';
import { useAtom } from 'jotai/index';

import OflineIcon from '@app/assets/icons/OflineIcon';
import FormRenderer from '@app/components/Agent/FormRenderer/FormRenderer';
import EmptyScreen from '@app/components/molecules/EmptyScreen';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';

import ContentHeader from './ContentHeader';

const AgentManualTriggerComponent = ({ agent }: { agent?: IAgent }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [, setSelectedFunction] = useAtom(selectedFunctionAtom);
    const [, setErrorIndex] = useAtom(errorAtom);
    const handleOnClickFunctionsTab = (item: IFunctionsItem) => {
        setOpenDialog(true);
        setSelectedFunction(item);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpenDialog(isOpen);
        if (!isOpen) {
            setErrorIndex([]);
            setSelectedFunction(null);
        }
    };

    const handleOnClickCloseIcon = () => {
        setOpenDialog(false);
    };

    return (
        <>
            {agent?.is_active && (
                <>
                    <ContentHeader>
                        <div className={'flex items-center gap-3'}>
                            <span className={'text-[20px] font-semibold'}>
                                Available Functions
                            </span>
                        </div>
                    </ContentHeader>

                    <div
                        className={
                            'flex h-full w-full flex-col gap-12 overflow-y-auto px-2'
                        }
                    >
                        {AvailableFunctions.map((func) => {
                            return (
                                <div key={func.group} className="flex flex-col gap-4">
                                    <span
                                        className={
                                            'inline-flex font-semibold text-brand-Black-300'
                                        }
                                    >
                                        {func.group}
                                    </span>
                                    <div
                                        className={
                                            'flex flex-wrap gap-x-6 gap-y-4 px-2 '
                                        }
                                    >
                                        {func.items.map((item) => {
                                            return (
                                                <div
                                                    onClick={() =>
                                                        handleOnClickFunctionsTab(item)
                                                    }
                                                    key={item.id}
                                                    className={
                                                        'flex h-[130px] w-full cursor-pointer flex-col gap-2 rounded-md bg-brand-White-200 px-3 py-2  drop-shadow-md hover:bg-gray-200 lg:w-[300px]'
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'text-sm font-[550] text-brand-Black-100/90'
                                                        }
                                                    >
                                                        {item.name}
                                                    </span>
                                                    <span
                                                        className={
                                                            'text-xs text-brand-Black-300/80'
                                                        }
                                                    >
                                                        {item.description}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            <Dialog open={openDialog} onOpenChange={handleOpenChange}>
                <DialogContent
                    className={
                        'overflow-hidden !p-0 max-md:w-full max-sm:h-full md:!min-w-[650px]'
                    }
                    onClickCloseIcon={() => handleOnClickCloseIcon()}
                >
                    <FormRenderer
                        agent={agent}
                        closeModal={(boolVal) => handleOpenChange(boolVal)}
                    />
                </DialogContent>
            </Dialog>
            {(agent?.is_active === false ||
                agent?.is_active === null ||
                agent?.is_active === undefined) && (
                <EmptyScreen msg="Agent is not active" customIcon={<OflineIcon />} />
            )}
        </>
    );
};

export default AgentManualTriggerComponent;
