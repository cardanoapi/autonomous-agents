import React, { useState } from 'react';

import { IAgent } from '@api/agents';
import { AvailableFunctions, IFunctionsItem } from '@models/types/functions';
import { useAtom } from 'jotai/index';

import FormRenderer from '@app/components/Agent/FormRenderer/FormRenderer';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';

import { cn } from '../lib/utils';
import ErrorPlaceholder from './ErrorPlaceholder';

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

    // if (agent?.is_active === false || agent?.is_active === null) {
    //     return <AgentOfflinePlaceholder />;
    // }

    return (
        <div className={'relative flex h-full w-full flex-col gap-2'}>
            <div className={'flex items-center gap-3'}>
                <span className={'text-[20px] font-semibold'}>Available Functions</span>
            </div>
            <ScrollArea className={'h-agentComponentHeight overflow-y-auto py-4 pr-4'}>
                <div className={'flex flex-col gap-12 px-2'}>
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
                                <div className={'flex flex-wrap gap-x-6 gap-y-4 px-2 '}>
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
            {(agent?.is_active === false ||
                agent?.is_active === null ||
                agent?.is_active === undefined) && (
                <ErrorPlaceholder
                    className="absolute h-full w-full border-0"
                    title="Agent seems to be Offline"
                    content="Run the Agent for Manual Actions."
                    icon={AgentsIcon}
                />
            )}
        </div>
    );
};

export default AgentManualTriggerComponent;

const AgentOfflinePlaceholder = ({ className }: { className?: string }) => (
    <div
        className={cn(
            'flex h-full w-full items-center justify-center rounded border-[4px] border-dashed border-gray-200 bg-slate-50',
            className
        )}
    >
        <div className="flex flex-col items-center gap-2">
            <span className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-300">
                <AgentsIcon className="mb-1 h-8 w-8" />
                Agent seems to be Offline.
            </span>
            <span className="text-base text-gray-300">
                Agent needs to be online for Manual Actions.
            </span>
        </div>
    </div>
);
