import { Children } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Card, CardContent, CardDescription, CardHeader } from './Card';

const meta = {
    title: 'Card',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children: (
            <>
                <CardHeader>Agent Discription</CardHeader>
            </>
        )
    }
};
