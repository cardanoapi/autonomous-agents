import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import CustomTooltip from './CustomTooltip';

const meta = {
    title: 'CustomTooltip',
    component: CustomTooltip,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof CustomTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {}
};
