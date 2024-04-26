import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  SelectedTemplateCard  from './SelectedTemplateCard';

const meta = {
    title: 'SelectedTemplateCard',
    component: SelectedTemplateCard,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof SelectedTemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args : {
        templateName : "SendAda",
        handleUnselect : ()=>{}
    }
};
