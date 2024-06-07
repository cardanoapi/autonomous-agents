import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Switch } from './Switch';

const meta = {
    title: 'Switch',
    component: Switch,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {}
};
