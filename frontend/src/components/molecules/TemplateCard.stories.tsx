import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import TemplateCard from './TemplateCard';

const meta = {
    title: 'TemplateCard',
    component: TemplateCard,
    parameters: {
        layout: 'centered'
    },
    decorators: [(Story) => <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>],

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        template: {
            name: 'Send Ada Template',
            description: 'Send Ada to Eco Charity every 3 Days',
            id: 'qerqwer'
        }
    }
};
