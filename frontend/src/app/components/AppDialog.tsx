import React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@app/components/atoms/Dialog';

interface AppDialogProps extends React.PropsWithChildren {
    isOpen?: boolean;
    toggleDialog?: (open: boolean) => void;
}

interface AppDialogContentProps extends React.PropsWithChildren {
    title?: string;
    description?: string;
    className?: string;
}

export const AppDialogContent: React.FC<AppDialogContentProps> = (props) => {
    const { title, description, children, className } = props;

    return (
        <DialogContent className={className}>
            <DialogHeader className="mb-2">
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>

            {children}
        </DialogContent>
    );
};

const AppDialog: React.FC<AppDialogProps> = ({ isOpen, toggleDialog, children }) => {
    return (
        <Dialog open={isOpen} onOpenChange={toggleDialog}>
            {children}
        </Dialog>
    );
};

export default AppDialog;
