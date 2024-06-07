import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import AgentCard from './AgentCard';

const meta = {
    title: 'AgentCard',
    component: AgentCard,
    parameters: {
        layout: 'centered'
    },
    decorators: [
        (Story) => (
            <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>
        )
    ],
    tags: ['autodocs'],
    argTypes: {}
} satisfies Meta<typeof AgentCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        agentName: 'Agent#1',
        agentRole: 'Drep',
        agentID: '0',
        templateID: 'null',
        functionCount: 3,
        lastActive: '2024-4-19',
        totalTrigger: 65
    }
};
