import { Trash2 } from 'lucide-react';
import { Edit } from 'lucide-react';

import { Card } from '@app/components/molecules/Card';

import { IFormFunctionInstance } from '../page';

interface IFunctionCards {
    functions: IFormFunctionInstance[];
    onUnselect: (item: IFormFunctionInstance) => void;
    onEdit: (item: IFormFunctionInstance) => void;
}
export const FunctionCards = ({ functions, onUnselect, onEdit }: IFunctionCards) => {
    return functions.map((functionItem, index) => (
        <Card
            className="group flex min-h-24 min-w-72 gap-y-2 bg-brand-White-200 p-4 py-4"
            key={index}
        >
            <div className="flex w-full items-center justify-between">
                <span className="card-h2">{functionItem.name}</span>
                <div className="flex items-center gap-2">
                    <Edit
                        color="#A1A1A1"
                        className="cursor-pointer"
                        onClick={() => onEdit(functionItem)}
                    />
                    <Trash2
                        color="#A1A1A1"
                        className="cursor-pointer"
                        onClick={() => onUnselect(functionItem)}
                    />
                </div>
            </div>
            <span className="h4 text-start">{functionItem.description}</span>
        </Card>
    ));
};
