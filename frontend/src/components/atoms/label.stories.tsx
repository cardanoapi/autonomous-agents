import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './label';

const meta = {
    title: 'Label',
    component: Label,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children: 'Agent Name',
        size: 'large'
    }
};
