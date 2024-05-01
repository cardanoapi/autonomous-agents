import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import MultipleSelector, { Option } from './MultiSearchSelect';

const meta = {
    title: 'SearchSelect',
    component: MultipleSelector,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof MultipleSelector>;

const OPTIONS: Option[] = [
    { label: 'Send Ada', value: 'SendAda' },
    { label: 'Create Proposal', value: 'CreatePropsal' },
    { label: 'Vote Propsal', value: 'VotePropsal' },
    { label: 'Burn Token', value: 'BurnToken' }
];

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        options: OPTIONS,
        placeholder: 'Select Template Template',
        emptyIndicator: 'No result FOund',
        maxSelected: 1
    }
};
