import type { Meta } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';

import AgentCard from '@app/components/organisms/cards/AgentCard';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

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
export const Primary: {
    args: {
        agentID: string;
        lastActive: string;
        agentName: string;
        templateID: string;
        functionCount: number;
        totalTrigger: number;
    };
} = {
    args: {
        agentName: 'Agent#1',
        agentID: '0',
        templateID: 'null',
        functionCount: 3,
        lastActive: '2024-4-19',
        totalTrigger: 65
    }
};
