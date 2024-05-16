import type { Meta, StoryObj } from '@storybook/react';
import TriggerForm from './TriggerForm';
import { IOption } from '@app/components/molecules/MultiSearchSelect';

export const DemoAgentFunctionOptions: IOption[] = [
    { label: 'Send Ada', value: 'SendAda' },
    { label: 'Create Proposal', value: 'CreatePropsal' },
    { label: 'Vote Propsal', value: 'VotePropsal' },
    { label: 'Burn Token', value: 'BurnToken' }
];

const meta = {
    title: 'Trigger Form',
    component: TriggerForm,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof TriggerForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        formValues : DemoAgentFunctionOptions[0],
        onSubmit: (()=>{console.log("running test : onSubmit")}),
        setClose : (()=>{console.log("running test : onClose")})
    }
};
