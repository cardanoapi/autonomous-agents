import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  OverViewCard  from './OverViewCard';
import { Card } from '../atoms/Card';
import { Car } from 'lucide-react';

const meta = {
    title: 'OverViewCard',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    
    args: {
        children : <OverViewCard title="Number of Agents" value={256} />,
        className : 'bg-transparent border-none w-[1072px] items-center flex'
    
    }
};
