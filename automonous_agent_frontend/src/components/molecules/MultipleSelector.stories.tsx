import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import MultipleSelector , {Option} from './MultipleSelector';

const meta = {
    title: 'MultipleSelector',
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
    { label: 'Vote Propsal', value:'VotePropsal'},
    { label: 'Burn Token' , value:'BurnToken' }
  ];

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        options : OPTIONS,
        placeholder : "Add Agent Function",
        emptyIndicator : "No result FOund",
}
}
