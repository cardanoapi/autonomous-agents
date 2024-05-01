import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import CronTriggerForm from './CronTriggerForm';

const meta = {
    title: 'CronTriggerForm',
    component: CronTriggerForm,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof CronTriggerForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        functionName : "Send Ada Function",
        setClose : null
    }
};
