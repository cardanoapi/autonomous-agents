import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  {Tabs}  from './Tabs';
import { TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

const meta = {
    title: 'Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children : <TabsList>
            <TabsTrigger value='Minute'>Minute</TabsTrigger>
            <TabsTrigger value='Hour'>Hour</TabsTrigger>
            <TabsTrigger value='Day'>Day</TabsTrigger>
            <TabsTrigger value='CUstom'>Custom</TabsTrigger>
            <TabsContent value='Minute'>
                <span>Customize minute here</span>
            </TabsContent>
        </TabsList>
    }
};
