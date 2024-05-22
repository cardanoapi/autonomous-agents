import { Card } from "@app/components/atoms/Card"

export interface IOverViewCard{
    title? : String
    value? : number
    footer? : any
}

export default function OverViewCard({title , value , footer} : IOverViewCard){
    return (
        <Card className="w-full h-full p-4 gap-y-0">
            <div className="h4">{title}</div>
            <div className="card-h1 mt-2 pl-[1px]">{value}</div>
            <footer/>
        </Card>
    )
}