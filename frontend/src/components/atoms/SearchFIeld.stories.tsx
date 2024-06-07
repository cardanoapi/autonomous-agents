import type { Meta, StoryObj } from '@storybook/react';

import { SearchField } from './SearchField';

const meta = {
    title: 'SearchField',
    component: SearchField,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        placeholder: 'Search for Templates',
        variant: 'primary'
    }
};
