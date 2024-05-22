import { Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import TemplateIcon from '../icons/TemplatesIcon';
import { Truncate } from '@app/utils/common/extra';
import { useMutation } from '@tanstack/react-query';
import { deleteTemplatebyID } from '@app/app/api/templates';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

export interface ITemplateCard {
    name: string;
    id: string;
    description: string;
    functionCount: number;
    templateTrigger: string;
}

export default function TemplateCard({
    name,
    id,
    description,
    functionCount,
    templateTrigger,
}: ITemplateCard) {

    const deleteTemplate = useMutation({
        mutationFn : (templateID : string) => deleteTemplatebyID(templateID),
        onSuccess : ()=> {
            queryClient.refetchQueries({queryKey : ['templates']})}
    })

    function handleDelete(templateID : string){
        deleteTemplate.mutateAsync(templateID)
    }
    return (
        <Card className="hover-transition-primary flex h-[157px] w-[271px] max-h-[157px] max-w-[271px] flex-col justify-between gap-y-0 p-4 pb-6 pr-4">
            <div>
                <div className='flex justify-between'>
                    <div className="flex items-center gap-x-2">
                        <TemplateIcon fill="#2196F3" />
                        <CardTitle className="!h2">{Truncate(name , 17)}</CardTitle>
                    </div>
                    <div onClick={() => {handleDelete(id)}}>
                        <Trash2 stroke='#A1A1A1'/>
                    </div>
                </div>
                <CardDescription className="card-description1 mt-2">
                    {Truncate(description,60)}
                </CardDescription>
            </div>
            <CardContent className="flex flex-col gap-y-2 ">
                <span className="card-h4 ">Functions : {functionCount}</span>
                <span className="card-h4">Trigger : {templateTrigger}</span>
            </CardContent>
        </Card>
    );
}
