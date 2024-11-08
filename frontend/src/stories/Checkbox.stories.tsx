import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '@app/components/atoms/Checkbox';

const meta = {
    title: 'Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {}
};
