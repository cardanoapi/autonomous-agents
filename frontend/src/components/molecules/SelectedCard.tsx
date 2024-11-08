import { Trash2 } from 'lucide-react';

import { Card } from './Card';

export default function SelectedCard({
    name,
    handleUnselect = () => {
        console.log('Handle unselect');
    },
    description
}: {
    name: string;
    description?: any;
    handleUnselect: any;
    handleEdit?: any;
    className?: string;
}) {
    return (
        <Card className="group flex min-h-24 min-w-72 gap-y-2 bg-brand-White-200 p-4 py-4">
            <div className="flex w-full items-center justify-between">
                <span className="card-h2">{name}</span>
                <Trash2
                    color="#A1A1A1"
                    className="cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    onClick={handleUnselect}
                />
            </div>
            <span className="h4 text-start">{description}</span>
        </Card>
    );
}
