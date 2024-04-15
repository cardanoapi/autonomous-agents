import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,} from './DropDownMenu';

const meta = {
  title: 'DropdownMenu',
  component: DropdownMenu,
  parameters: {
  
    layout: 'centered',
  },
 
  tags: ['autodocs'],

  argTypes: {
  },
  
 
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
  args: {
    children : 
    <>
      <DropdownMenuTrigger>Today</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Today</DropdownMenuItem>
        <DropdownMenuItem>Yesterday</DropdownMenuItem>
        <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
        <DropdownMenuItem>Custom Date</DropdownMenuItem>
      </DropdownMenuContent>
    </>
  },
};