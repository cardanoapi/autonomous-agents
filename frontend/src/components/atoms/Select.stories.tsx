import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from './Select';

const meta = {
    title: 'Select',
    component: Select,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        children: (
            <>
                <SelectTrigger className="w-[297px] ">
                    <SelectValue placeholder="Select Agent Role"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="1">Send Ada</SelectItem>
                        <SelectItem value="2">Vote on Proppsal</SelectItem>
                        <SelectItem value="3">Create Propsal</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </>
        )
    }
};
