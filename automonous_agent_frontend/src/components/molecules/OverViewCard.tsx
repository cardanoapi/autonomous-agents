import { Card, CardTitle , CardHeader, CardDescription } from "../atoms/Card"

export interface IOverViewCard{
    title? : String
    value? : number
    footer? : any
}

export default function OverViewCard({title , value , footer} : IOverViewCard){
    return (
        <Card className="w-[269px] h-[143px] p-4">
            <CardHeader className="font-[400] text-sm p-0">{title}</CardHeader>
            <CardDescription className="font-[600] text-xl mt-4 pl-[1px]">{value}</CardDescription>
        </Card>
    )
}