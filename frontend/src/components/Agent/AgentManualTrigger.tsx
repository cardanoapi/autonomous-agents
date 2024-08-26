import React, { useState } from 'react';

import { AvailableFunctions, IFunctionsItem } from '@models/types/functions';
import { useAtom } from 'jotai/index';

import { IAgent } from '@app/app/api/agents';
import FormRenderer from '@app/components/Agent/FormRenderer/FormRenderer';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';

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

    if (agent?.is_active === false || agent?.is_active === null) {
        return <AgentOfflinePlaceholder />;
    }

    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <span>Available functions:</span>
            <ScrollArea className={'h-agentComponentHeight overflow-y-auto pr-4'}>
                <div className={'flex flex-col gap-4'}>
                    {AvailableFunctions.map((func) => {
                        return (
                            <div key={func.group}>
                                <span className={'font-semibold text-brand-Black-300'}>
                                    {func.group}
                                </span>
                                <div className={'flex flex-wrap gap-4 '}>
                                    {func.items.map((item) => {
                                        return (
                                            <div
                                                onClick={() =>
                                                    handleOnClickFunctionsTab(item)
                                                }
                                                key={item.id}
                                                className={
                                                    'flex h-[130px] w-full cursor-pointer flex-col gap-2 rounded-md bg-gray-100 px-3 py-2 drop-shadow-md hover:bg-gray-200 lg:w-[300px]'
                                                }
                                            >
                                                <span className={'text-sm font-normal'}>
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
            </ScrollArea>
            <Dialog open={openDialog} onOpenChange={handleOpenChange}>
                <DialogContent
                    className={'!min-w-[650px] !p-0'}
                    onClickCloseIcon={() => handleOnClickCloseIcon()}
                >
                    <FormRenderer
                        agent={agent}
                        closeModal={(boolVal) => handleOpenChange(boolVal)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AgentManualTriggerComponent;

const AgentOfflinePlaceholder: React.FC = () => (
    <div className="flex h-full w-full items-center justify-center rounded border-[4px] border-dashed border-gray-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2">
            <span className="flex items-center justify-center gap-2 text-2xl text-gray-300">
                <AgentsIcon className="mb-1 h-8 w-8" />
                Agent is Offline.
            </span>
            <span className="text-xl text-gray-300">
                Start the Agent to trigger Functions manually.
            </span>
        </div>
    </div>
);
