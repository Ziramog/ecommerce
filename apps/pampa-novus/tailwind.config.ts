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
        pampa: {
          50: '#FAF8F5',
          100: '#F4EFE6',
          200: '#E6DCCF',
          300: '#D5C4B0',
          400: '#B89F82',
          500: '#947758',
          600: '#795D40',
          700: '#5C442D',
          800: '#412F1F',
          900: '#2A1D13',
          950: '#19110A',
        },
        leather: {
          light: '#C99D66',
          DEFAULT: '#8B4513',
          dark: '#542807',
          black: '#1F1610',
        },
        alpaca: {
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
        },
        brass: {
          light: '#E5C07B',
          DEFAULT: '#C69234',
          dark: '#93661B',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(25, 17, 10, 0.08)',
        'luxury-hover': '0 25px 50px -12px rgba(25, 17, 10, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
