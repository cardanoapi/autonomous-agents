import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '@app/components/molecules/Card';
import ComboBox, { IComboBoxOption } from '@app/components/molecules/ComboBox';

const demoOptions: IComboBoxOption[] = [
    {
        label: 'Newest',
        value: 'Newest'
    },
    {
        label: 'Oldest',
        value: 'Oldest'
    },
    {
        label: 'Most Used',
        value: 'Most Used'
    }
];

const meta = {
    title: 'ComboBoxSelect',
    component: ComboBox,
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
        options: demoOptions,
        className: '',
        defaultValue: 'Oldest'
    }
};
