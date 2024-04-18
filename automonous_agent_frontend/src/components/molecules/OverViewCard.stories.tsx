import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  OverViewCard  from './OverViewCard';

const meta = {
    title: 'OverViewCard',
    component: OverViewCard,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof OverViewCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        title : 'No of Agents',
        value : 210
    }
};
