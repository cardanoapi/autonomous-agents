import { IAgent } from '@api/agents';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Label } from '../atoms/label';
import { NumberInput } from '../molecules/NumberInput';
import AgentRunnerComponent from './AgentRunner';

export default function AgentSettingsComponent({
    agent
}: {
    agent: IAgent | undefined;
}) {
    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="flex flex-col gap-4 ">
                <div className="h1">Saved Settings</div>
                <div></div>
                <div className="flex flex-col gap-2">
                    <Label>Agent Name</Label>
                    <Input value={agent?.name} className="mx-[2px]" viewOnly={true} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Agent Instance</Label>
                    <NumberInput
                        value={agent?.instance}
                        className="mx-[2px]"
                        viewOnly={true}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Agent Description</Label>
                    <Textarea
                        value={
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet nulla auctor, vestibulum magna sed, convallis ex.'
                        }
                        className="mx-[2px]"
                        viewOnly={true}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button variant={'primary'} size={'sm'} className="min-w-32">
                    Edit
                </Button>
            </div>
        </div>
    );
}
