import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import  NumberInputV2 from './NumberInputV2'

const meta = {
  title: 'NumberInputV2',
  component: NumberInputV2,
  parameters: {
  
    layout: 'centered',
  },
 
  tags: ['autodocs'],

  argTypes: {
  },
  
 
} satisfies Meta<typeof NumberInputV2>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
  args: {
    placeholder : "Enter Agent Name",
    className : "w-[297px]"
  },
};