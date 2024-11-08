import { Card } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import OverViewTemplatesCard from '@app/components/organisms/cards/TemplateDashboardCard';

const meta = {
    title: 'OverViewTemplatesCard',
    component: Card,
    parameters: {
        layout: 'centered'
    },

    tags: ['autodocs'],

    argTypes: {}
} satisfies Meta<typeof OverViewTemplatesCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: {
        className: 'w-[269px] h-[143px]',
        children: (
            <OverViewTemplatesCard
                title="Number of Templates"
                totalTemplates={15}
                defaultTemplates={5}
                customTemplates={10}
            />
        )
    }
};
