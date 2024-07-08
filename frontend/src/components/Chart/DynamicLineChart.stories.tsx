import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '@app/components/atoms/Card';

import DynamicLineChart from './DynamicLineChart';

const meta = {
    title: 'DynamicLineChart',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof DynamicLineChart>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children: <DynamicLineChart />,
        className: 'w-[800px] h-[400px]'
    }
};
