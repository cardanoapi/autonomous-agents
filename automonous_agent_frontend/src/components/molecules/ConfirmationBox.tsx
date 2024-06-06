import { CircleAlert } from 'lucide-react';
import { X } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { cn } from '../lib/utils';

export default function ConfirmationBox({
    msg,
    title,
    onAccept = ()=>{},
    onDecline = ()=>{},
    acceptPlaceholder = 'Delete',
    declinePlaceholder = 'Cancel',
    className = '',
    showDangerIcon = true,
    onClose = ()=>{}
}: {
    msg: string;
    title: string;
    onAccept?: any;
    onDecline?: any;
    acceptPlaceholder?: string;
    declinePlaceholder?: string;
    className?: string;
    showDangerIcon?: boolean;
    onClose? : any
}) {
    return (
        <Card className={cn('flex w-full gap-y-4', className)}>
            <div className="flex justify-between w-full items-start">
                <div className="flex gap-x-2 font-medium items-center">
                    {showDangerIcon && <CircleAlert fill="#D04D52" stroke="#fff" />}
                    {title}
                </div>
                <X className="cursor-pointer mt-[-12px]" onClick={()=>{onClose()}}/>
            </div>
            <div className="max-w-[80%] text-[14px] font-normal">{msg}</div>
            <div className="flex justify-end gap-x-2">
                <Button variant={'cool'} className="h-[36px] w-[145px]" onClick={()=>{onDecline()}}>
                    {declinePlaceholder}
                </Button>
                <Button variant={'danger'} className="h-[36px] w-[145px]" onClick={()=>{onAccept()}}>
                    {acceptPlaceholder}
                </Button>
            </div>
        </Card>
    );
}
