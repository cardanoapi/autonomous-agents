
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import  FilterSelect, { ISelectItem }  from './FilterSelect'

const meta = {
    title: 'FIlterSelect',
    component: FilterSelect,
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
} satisfies Meta<typeof FilterSelect>;

const options : ISelectItem[] = [
    {
        label : "Newest",
        value : "Newest"
    },
    {
        label : "Oldest",
        value : "Oldest"
    },
    {
        label : "Most used",
        value : "MostUsed"
    }
]

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        value : "Newest",
        options: options
    }
};
