import { LoaderCircle } from 'lucide-react';

import { Button } from '../atoms/Button';
import { cn } from '../shadcn/lib/utils';

interface SubmitButtonProps {
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function SubmitButton({
    disabled = false,
    className = '',
    placeholder = 'Create'
}: SubmitButtonProps) {
    return (
        <Button
            type="submit"
            variant="primary"
            size="md"
            className={cn('flex min-w-36 items-center justify-between', className)}
            disabled={disabled}
        >
            <div className={cn('flex items-center', disabled ? 'fixed' : 'hidden')}>
                <LoaderCircle
                    className="mr-2 animate-spin stroke-white"
                    strokeWidth={3}
                />
            </div>
            <span className="flex-1 text-center">{placeholder}</span>
        </Button>
    );
}
