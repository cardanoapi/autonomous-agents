import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import TemplateIcon from '../icons/TemplatesIcon';


export interface ITemplateCard {
    templateName: string;
    templateDescription: string;
    functionCount: number;
    templateTrigger: string;
}

export default function TemplateCard({
    templateName,
    templateDescription,
    functionCount,
    templateTrigger
}: ITemplateCard) {
    return (
        <Card className="h-[157px] p-4 pr-8">
            <div className="flex items-center gap-x-2">
                <TemplateIcon fill="#2196F3" />
                <CardTitle className="h2">{templateName}</CardTitle>
            </div>
            <CardDescription className="card-description1 mt-1">
                {templateDescription}
            </CardDescription>
            <CardContent className="mt-3 flex flex-col gap-y-1">
                <span className="card-h4 ">Functions : {functionCount}</span>
                <span className="card-h4">Trigger : {templateTrigger}</span>
            </CardContent>
        </Card>
    );
}
