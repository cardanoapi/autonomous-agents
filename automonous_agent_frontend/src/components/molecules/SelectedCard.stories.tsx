import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import SelectedCard from './SelectedCard';

const meta = {
    title: 'SelectedCard',
    component: SelectedCard,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof SelectedCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        name: 'SendAda',
        handleUnselect: () => {}
    }
};
