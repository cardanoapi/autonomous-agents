import { DropdownMenu, DropdownMenuTrigger } from "@app/components/atoms/DropDownMenu"
import { Label } from "@app/components/atoms/label"
import { SearchField } from "@app/components/atoms/SearchField"

export default function AgentsPage(){
    return(
        <>
        <div className="flex gap-x-4 items-center">
            <Label size={"large"} className="text-[18px]">Agents(8)</Label>
            <SearchField placeholder="Search agents" variant={"secondary"} className="w-[240px] h-[40px]"></SearchField>
        </div>
        </>
    )
}