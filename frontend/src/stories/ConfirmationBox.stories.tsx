import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import ConfirmationBox from '@app/components/molecules/ConfirmationBox';

const meta = {
    title: 'ConfirmationBox',
    component: ConfirmationBox,
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
} satisfies Meta<typeof ConfirmationBox>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        msg: 'Are you sure you want to delete this? This action cannot be undone.',
        className: 'w-[513px]',
        title: 'Confirm Delete?'
    }
};
