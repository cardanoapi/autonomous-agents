import React from 'react';

import { useAppDialog } from '@hooks';
import { Cross2Icon } from '@radix-ui/react-icons';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@app/components/atoms/Dialog';

interface AppDialogProps extends React.PropsWithChildren {
    title?: string;
    description?: string;
    className?: string;
}

export default function AppDialog(props: AppDialogProps) {
    const { title, description, children, className } = props;

    const { isDialogOpen, closeDialog, setDialogOpen } = useAppDialog();

    return (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className={className}>
                <DialogHeader className="mb-2">
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                    <div
                        onClick={closeDialog}
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
                    >
                        <Cross2Icon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </div>
                </DialogHeader>

                <div>{children}</div>
            </DialogContent>
        </Dialog>
    );
}
