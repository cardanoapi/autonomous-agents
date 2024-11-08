import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '@app/components/molecules/Card';
import CustomLineChart from '@app/components/organisms/chart/CustomLineChart';

const meta = {
    title: 'CustomLineChart',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof CustomLineChart>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        className: 'w-[70vh] h-[40vh]',
        children: <CustomLineChart />
    }
};
