import type { Meta, StoryObj } from '@storybook/react';

import MultipleSelector, { IOption } from '@app/components/molecules/MultiSearchSelect';

const meta = {
    title: 'MultiSearchSelect',
    component: MultipleSelector,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof MultipleSelector>;

const OPTIONS: IOption[] = [
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
        maxSelected: 4
    }
};
