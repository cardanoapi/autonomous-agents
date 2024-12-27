import type { Config } from 'tailwindcss';

const config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './.storybook/**/*.tsx',
        './storybook/*.tsx',
        './src/components/**/*{ts,tsx}'
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1536px'
            }
        },
        extend: {
            backgroundImage: {
                brandDefault: 'linear-gradient(to right, #F8F9FC, #F5F5FC, #E9EAF8)'
            },
            screens: {
                '3xl': '1620px',
                '4xl': '1800px',
                '5xl': '2000px'
            },
            colors: {
                background: '#FFFFFF',
                brand: {
                    100: '',
                    lightBlue: '#D6E2FF',
                    primaryBlue: '#0033AD',
                    navy: '#000080',
                    Blue: {
                        100: '#1C63E71F',
                        200: '#1C63E7',
                        300: '#0C50B4'
                    },
                    Black: {
                        100: '#252323',
                        200: '#292929',
                        300: '#2E2E2E'
                    },
                    Gray: {
                        50: '#8E908E',
                        100: '#AAAAAA',
                        200: '#2E2E2E',
                        300: '#4A4A4A',
                        400: '#EBEBEB'
                    },
                    Inactive: {
                        100: '#8C8C8C'
                    },
                    Azure: {
                        100: '#F1F4F8',
                        200: '#F8F8F8',
                        300: '#F8F9FC',
                        400: '#F9FAFC'
                    },
                    White: {
                        100: '#FFF',
                        200: '#F5F5F5'
                    },
                    Green: {
                        100: '#C3FCBB',
                        200: '#008000'
                    },
                    border: {
                        100: '#EDECED',
                        200: '#C4C4C4',
                        300: '#ECE9F1',
                        400: '#EAEAEA'
                    },
                    active: {
                        100: '#000000DE'
                    },
                    switch: {
                        inactive: '#8C8C8C',
                        active: '#1C63E7'
                    },
                    Red: {
                        100: '#D04D52',
                        200: '#a32227'
                    },
                    Orange: {
                        100: '#FFECD4',
                        200: '#FF660F'
                    },
                    vscode:"#1E1E1E"
                }
            },
            height: {
                agentComponentHeight: 'calc(100% - 30px)',
                proposalEmptyListHeight: 'calc(100vh - 260px)',
                modalHeight: 'calc(100% - 45px)',
                govActionsPageHeight: 'calc(100vh - 320px)',
                dRepsPageHeight: 'calc(100vh - 314px)',
                defaultPageHeightwithoutTopNav: 'calc(100vh - 140px)',
                logsPageHeight: 'calc(100vh - 280px)',
                proposalListHeight: 'calc(100vh - 260px)',
                drepListHeight: 'calc(100vh - 280px)'
            },
            maxHeight: {
                agentsList: 'calc(100vh - 210px)',
                logsList: 'calc(100vh - 240px)'
            },
            maxWidth: {
                agentComponentWidth: 'calc(100% - 230px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require('tailwindcss-animate')]
} satisfies Config;

export default config;
