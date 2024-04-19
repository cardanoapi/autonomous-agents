import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  AgentCard  from './AgentCard';

const meta = {
    title: 'AgentCard',
    component: AgentCard,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof AgentCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        agentName : "Agent#1",
        agentRole : "Drep",
        template : "SendAda Template",
        funcionCount : 3 ,
        lastActive : "2024-4-19",
        totalTrigger : 65
    }
};
