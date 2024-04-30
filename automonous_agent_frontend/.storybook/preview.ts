import type { Preview } from '@storybook/react';
import '@app/assets/css/globals.css'
import '@app/assets/css/tailwind.css'

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    }
};

export default preview;