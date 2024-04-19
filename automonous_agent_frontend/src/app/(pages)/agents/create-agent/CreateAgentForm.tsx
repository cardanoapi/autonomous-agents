import { Card } from "@app/components/atoms/Card"
import { Label } from "@app/components/atoms/label"
import { Input} from "@app/components/atoms/Input"
import MultipleSelector , {Option} from "@app/components/molecules/MultipleSelector"
import { NumberInput } from "@app/components/molecules/NumberInput"
import { Button } from "@app/components/atoms/Button"

export default function CreateAgentForm(){

    const AgentTemplateOptions : Option[] = [ 
        {label : 'Default Template' , value : 'Default Template'},
        {label : 'Template01' , value: 'Template1'},
        {label : 'Test Template' , value: 'Test Template'}
    ]


    return (
        <Card className="w-[790px] min-h-[493px]">
            <Label>Agent Name</Label>
            <Input placeholder='Enter Agent Name' className="mt-3 w-[297px]"/>

            <Label className="inline-flex mt-6">Agent Template</Label>
            <div className="w-[297px] mt-3">
            <MultipleSelector placeholder="Add Agent Template" options={AgentTemplateOptions} appearOnTop={true}/>
            </div>

            <Label className="inline-flex mt-6">Number of Agents</Label>
            <NumberInput className="mt-3"/>

            <Button variant="primary" size="md" className="mt-6 w-[145px]">Create</Button> 
        </Card>
    )
}