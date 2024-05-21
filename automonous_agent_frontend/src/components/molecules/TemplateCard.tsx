import { Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import TemplateIcon from '../icons/TemplatesIcon';

export interface ITemplateCard {
    name: string;
    id: string;
    description: string;
    functionCount: number;
    templateTrigger: string;
    ondelete?: any;
}

export default function TemplateCard({
    name,
    id,
    description,
    functionCount,
    templateTrigger,
    ondelete
}: ITemplateCard) {
    return (
        <Card className="hover-transition-primary flex h-[157px] w-[257px] flex-col justify-between gap-y-0 p-4 pb-6 pr-4">
            <div>
                <div className='flex justify-between'>
                    <div className="flex items-center gap-x-2">
                        <TemplateIcon fill="#2196F3" />
                        <CardTitle className="!h2">{name}</CardTitle>
                    </div>
                    <div onClick={() => {ondelete?.(id)}}>
                        <Trash2 stroke='#A1A1A1'/>
                    </div>
                </div>
                <CardDescription className="card-description1 mt-1">
                    {description}
                </CardDescription>
            </div>
            <CardContent className="flex flex-col gap-y-2 ">
                <span className="card-h4 ">Functions : {functionCount}</span>
                <span className="card-h4">Trigger : {templateTrigger}</span>
            </CardContent>
        </Card>
    );
}
