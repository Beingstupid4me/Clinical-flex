import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8EC641',
          light: '#A8D654',
          dark: '#7AB030',
        },
        secondary: {
          DEFAULT: '#0f644c',
          light: '#1a7d60',
          dark: '#054b38',
        },
        accent: {
          DEFAULT: '#be55d3',
          light: '#d170e3',
          dark: '#a83abc',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
