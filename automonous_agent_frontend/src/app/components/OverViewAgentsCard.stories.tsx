import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  OverViewAgentsCard  from './OverViewAgentsCard';
import { Card } from '@mui/material';

const meta = {
    title: 'OverViewAgentsCard',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof OverViewAgentsCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        className : 'w-[269px] h-[143px]',
        children : <OverViewAgentsCard title='Total Agents' totalAgents={200} activeAgents={172} inactiveAgents={38}/>
    }
};
