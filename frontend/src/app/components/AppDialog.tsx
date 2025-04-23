import React from 'react';

import { X } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/components/atoms/Dialog';

interface AppDialogProps extends React.PropsWithChildren {
    isOpen?: boolean;
    toggleDialog?: (open: boolean) => void;
}

interface AppDialogContentProps extends React.PropsWithChildren {
    title?: string;
    description?: string;
    className?: string;
    onClose?: (open: boolean) => void;
}

export const AppDialogContent: React.FC<AppDialogContentProps> = (props) => {
    const { title, description, children, className, onClose } = props;

    return (
        <DialogContent className={className} defaultCross={false}>
            <X className="absolute right-2 top-2 cursor-pointer" onClick={() => onClose?.(false)} />
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
