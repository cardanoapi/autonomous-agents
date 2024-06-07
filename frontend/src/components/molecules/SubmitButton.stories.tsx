import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Card } from '../atoms/Card';
import { SubmitButton } from './SubmitButton';

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
