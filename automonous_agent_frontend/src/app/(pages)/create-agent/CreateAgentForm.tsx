import { Card } from "@app/components/atoms/Card"
import { Label } from "@app/components/atoms/label"
import { Input} from "@app/components/atoms/Input"
import MultipleSelector from "@app/components/molecules/MultipleSelector"
import { NumberInput } from "@app/components/molecules/NumberInput"
import { Button } from "@app/components/atoms/Button"

export default function CreateAgentForm(){
    return (
        <Card className="w-[790px]">
            <Label>Agent Name</Label>
            <Input placeholder='Enter Agent Name' className="mt-3 w-[297px]"/>

            <Label className="inline-flex mt-6">Agent Template</Label>
            <MultipleSelector placeholder="Add Agent Template" className="h-[40px] w-[297px] mt-3"/>

            <Label className="inline-flex mt-6">Number of Agents</Label>

            <Button variant="primary" size="md">Create agent</Button> 
        </Card>
    )
}