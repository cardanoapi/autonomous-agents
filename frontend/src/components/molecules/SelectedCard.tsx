import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';

import { Card, CardTitle } from '../atoms/Card';

export default function SelectedCard({
    name,
    handleUnselect = () => {
        console.log('Handle unselect');
    },
    handleEdit = () => console.log('Handle Edit'),
    description
}: {
    name: string;
    description?: any;
    handleUnselect: Function;
    handleEdit?: Function;
    className?: string;
}) {
    return (
        <Card className="p-y-8 group flex h-24 max-w-72 justify-center gap-y-2 bg-brand-White-200 p-4">
            <div className="flex justify-between">
                <span className="card-h2">{name}</span>
                <div className="hidden items-center transition group-hover:flex">
                    <div
                        onClick={() => {
                            handleUnselect();
                        }}
                        className="cursor-pointer"
                    >
                        <Trash2 color="#A1A1A1" />
                    </div>
                </div>
            </div>
            <span className="h4 text-start">{description}</span>
        </Card>
    );
}
