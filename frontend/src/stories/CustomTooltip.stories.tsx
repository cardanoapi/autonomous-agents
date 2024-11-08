import type { Meta, StoryObj } from '@storybook/react';

import CustomTooltip from '@app/components/organisms/chart/CustomTooltip';

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
