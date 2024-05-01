import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

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
        functionName : "Send Ada Function",
        setClose : null
    }
};
