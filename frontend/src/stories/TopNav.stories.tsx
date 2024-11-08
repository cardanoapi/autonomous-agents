import type { Meta, StoryObj } from '@storybook/react';

import TopNav from '@app/components/layout/TopNav';
const meta = {
    title: 'TopNav',
    component: TopNav,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
