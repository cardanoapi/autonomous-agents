import type { Meta, StoryObj } from '@storybook/react';

import { NumberInput } from '@app/components/molecules/NumberInput';
const meta = {
    title: 'NumberInput',
    component: NumberInput,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {}
};
