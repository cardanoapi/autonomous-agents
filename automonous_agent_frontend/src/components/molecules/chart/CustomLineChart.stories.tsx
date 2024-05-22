import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@app/components/atoms/Card';

import  CustomLineChart  from './CustomLineChart';

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
        children : <CustomLineChart/>,
        className: "w-[800px] h-[400px]"
    }
};