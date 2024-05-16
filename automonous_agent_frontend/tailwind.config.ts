import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.tsx',
    './storybook/*.tsx',
    './src/components/**/*{ts,tsx)',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
        colors: {
            brand: {
                100:"",
                Blue : {
                  100 : "#E3F2FD",
                  200 : "#2196F3",
                  300 : "#0C50B4",
                },
                Black : {
                  100 : "#252323",
                  200 : "#292929",
                  300 : "#2E2E2E"
                } ,
                Gray : {
                  100 : "#AAAAAA", 
                  200 : "#2E2E2E",
                  300 : "4A4A4A",
                  400 : "#EBEBEB",
                },
                Inactive : {
                  100 : "#8C8C8C",
                },
                Azure : {
                  100 : "#F1F4F8",
                  200 : "#F8F8F8",
                  300 : '#F8F9FC'
                },
                White : {
                  100 : "#FFF",
                  200 : "#F5F5F5"
                },
                Green : {
                  100 : "#C3FCBB",
                  200: "#008000"
                },
                border : {
                  100 : "#EDECED",
                  200 : "#C4C4C4",
                  300 : "#ECE9F1",
                  400 : "#EAEAEA"
                },
                active : {
                  100 : "#000000DE",
                },
                switch : {
                  inactive : "#8C8C8C",
                  active : "#2196F3"
                }

            }
        },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config