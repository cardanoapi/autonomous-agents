import type { Meta, StoryObj } from '@storybook/react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './Select';

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
    render: () => (
        <Select>
            <SelectTrigger className="w-[297px]">
                <SelectValue placeholder="Select Agent Role" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="1">Send Ada</SelectItem>
                    <SelectItem value="2">Vote on Proposal</SelectItem>
                    <SelectItem value="3">Create Proposal</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
};
