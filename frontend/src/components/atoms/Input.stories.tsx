import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Input } from './Input'

const meta = {
  title: 'Input',
  component: Input,
  parameters: {
  
    layout: 'centered',
  },
 
  tags: ['autodocs'],

  argTypes: {
  },
  
 
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
  args: {
    placeholder : "Enter Agent Name",
    className : "w-[297px]"
  },
};