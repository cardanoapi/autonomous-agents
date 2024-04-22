import { Button } from "@app/components/atoms/Button"
import { Card } from "@app/components/atoms/Card"
import { Input } from "@app/components/atoms/Input"
import { Label } from "@app/components/atoms/label"
import { Textarea } from "@app/components/atoms/Textarea"
import MultipleSelector,{Option} from "@app/components/molecules/MultipleSelector"


export default function TemplateForm() {

    const AgentFunctionOptions: Option[] = [
        { label: 'Send Ada', value: 'SendAda' },
        { label: 'Create Proposal', value: 'CreatePropsal' },
        { label: 'Vote Propsal', value:'VotePropsal'},
        { label: 'Burn Token' , value:'BurnToken' }
      ];

    return (
        <Card className="w-[790px]">
            <Label>Template Name</Label>
            <Input placeholder="Enter Template Name" className="w-[297px] mt-3" />

            <Label className="inline-block mt-6">Template Description</Label>
            <Textarea placeholder="Text..." className="w-[297px] h-[123px] mt-3"/>

            <div className="w-[297px]">
            <Label className="inline-block mt-6">Agent Behaviour</Label>
            <MultipleSelector options={AgentFunctionOptions} placeholder="Add Agent Function" className="w-[297px] mt-3" appearOnTop={true}/>
            </div>

            <Button variant="primary" size="md" className="mt-6">Create Template</Button>
        </Card>
    )
}
