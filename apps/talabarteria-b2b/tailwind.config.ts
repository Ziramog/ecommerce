import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        b2b: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        saddle: {
          light: '#8D5B4C',
          DEFAULT: '#6B3A2A',
          dark: '#4A2418',
        },
        navy: {
          light: '#233857',
          DEFAULT: '#142238',
          dark: '#0A1220',
        },
        mercadal: {
          forest: '#1C3B2B',
          'forest-dark': '#14291E',
          cream: '#FAF8F5',
          sand: '#F4EFE8',
          stone: '#E8E2D8',
          espresso: '#1F1E1D',
          leather: '#6B3A2A',
          muted: '#78716C',
        },
      },
      fontFamily: {
        sans: ['"Proxima Nova"', 'var(--font-sans)', '-apple-system', 'Helvetica Neue', 'Helvetica', 'Roboto', 'Arial', 'sans-serif'],
        heading: ['var(--font-heading)', 'serif'],
        serif: ['var(--font-heading)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
