import type { Meta, StoryObj } from '@storybook/react';
import TriggerForm from './TriggerForm';
import { IOption } from '@app/components/molecules/MultiSearchSelect';
import { IParameter } from '@app/app/api/functions';

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


const demoParameter : IParameter[] = [
    {
        name : 'Test',
        description : 'Test',
        optional : false,
        data_type : 'string'
    },
    {
        name : 'Test2',
        description : 'Test2',
        optional : false,
        data_type : 'string'
    }

]

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        formValues : DemoAgentFunctionOptions[0],
        onSubmit: (()=>{console.log("running test : onSubmit")}),
        setClose : (()=>{console.log("running test : onClose")}),
        parameters : demoParameter
    }
};
