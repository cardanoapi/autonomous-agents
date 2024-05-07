import type { Meta, StoryObj } from '@storybook/react';
import { AgentFunctionOptions } from '../page';
import TriggerForm from './TriggerForm';

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
        formValues : AgentFunctionOptions[0],
        onSubmit: (()=>{console.log("running test : onSubmit")}),
        setClose : (()=>{console.log("running test : onClose")})
    }
};
