import type { StoryObj } from '@storybook/react';

import { Card } from '@app/components/atoms/Card';
import { SubmitButton } from '@app/components/molecules/SubmitButton';

const meta = {
    title: 'SubmitButton',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
};

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children: <SubmitButton />
    }
};
