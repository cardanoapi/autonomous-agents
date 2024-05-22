import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import  TemplateCard  from './TemplateCard';

const meta = {
    title: 'TemplateCard',
    component: TemplateCard,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        name : "Send Ada Template",
        id : 'qerqwer',
        description : "Send Ada to Eco Charity every 3 Days",
        functionCount : 3 ,
        templateTrigger : "Cron Trigger"
    }
};
