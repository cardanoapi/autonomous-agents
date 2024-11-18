import { Info } from "lucide-react"
import { cn } from "@app/components/lib/utils"

export default function InfoCard({onMouseEnter , onMouseLeave , visible} : {onMouseEnter : any , onMouseLeave : any , visible : boolean}) {
    return (
        <div className="flex self-end  mb-2 relative group">
        <Info className="hover:text-gray-400" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}/>
        <span className={cn("w-64 absolute top-4 left-10 p-4 rounded shadow bg-gray-100 hidden transition-opacity duration-200" , { "flex" : visible })}>
            Edit filter attributes by clicking on the filter node.
            <br />
            <br />
            Toggle logic relations by clicking on the operator node.
        </span>
        </div>

    )
}
