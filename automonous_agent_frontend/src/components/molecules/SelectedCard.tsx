import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';

import { Card, CardTitle } from '../atoms/Card';

export default function SelectedCard({
    templateName,
    handleUnselect = ()=>{console.log("Handle unselect")},
    handleEdit = ()=> (console.log("Handle Edit")),
    templateDescription = 'NA'
}: {
    templateName: String;
    templateDescription? : String
    handleUnselect: Function;
    handleEdit? : Function;
    className? : string
}) {
    return (
        <Card className="p-y-8 group flex gap-y-2 bg-brand-White-200 p-4 justify-center h-24 max-w-72">
            <div className="flex justify-between">
                <span className="card-h2">{templateName}</span>
                <div className="hidden transition group-hover:flex">
                    <div onClick={() => {handleEdit()}}>
                        <Pencil color="#A1A1A1" className='cursor-pointer'/>
                    </div>
                    <div onClick={()=>{handleUnselect()}} className='cursor-pointer'>
                        <Trash2 color="#A1A1A1" />
                    </div>
                </div>
            </div>
            <span className="h4 text-start">
                {templateDescription}
            </span>
        </Card>
    );
}

