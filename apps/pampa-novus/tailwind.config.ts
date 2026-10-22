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
        // Official Pampa Novus Brand Identity Palette V3
        pn: {
          marron: '#5A2F1F',    // Marrón Cuero — Fuerza y tradición (#5A2F1F oficial)
          cognac: '#8B4E2F',    // Cognac — Autenticidad
          terracota: '#B65A3C', // Terracota — Tierra y movimiento
          arena: '#D9C9A8',    // Arena — Naturaleza y equilibrio
          espresso: '#2E1C12', // Espresso — Solidez y elegancia
          crema: '#F5EBDD',    // Versión Clara / Reversa — Fondo cálido
          marfil: '#FAF7F2',   // Fondo de página ultra premium / blanco cálido
          borde: '#EFE8DE',    // Bordes sutiles para tarjetas y separadores
          borderDark: '#D9C9A8',
        },
        // Semantic aliases
        leather: {
          light: '#8B4E2F',
          DEFAULT: '#5A2F1F',
          dark: '#2E1C12',
          black: '#1A0F0A',
        },
        pampa: {
          50: '#FAF7F2',
          100: '#F5EBDD',
          200: '#EFE8DE',
          300: '#D9C9A8',
          400: '#C4AE88',
          500: '#B65A3C',
          600: '#8B4E2F',
          700: '#5A2F1F',
          800: '#412215',
          900: '#2E1C12',
          950: '#1A0F0A',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'DM Sans', '-apple-system', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'site': '1360px',
      },
      borderRadius: {
        'none': '0px',
        'xs': '1px',
        'sm': '2px',
        'DEFAULT': '3px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(46, 28, 18, 0.04)',
        'luxury': '0 8px 24px -6px rgba(46, 28, 18, 0.08)',
        'luxury-hover': '0 12px 32px -8px rgba(46, 28, 18, 0.12)',
      },
      letterSpacing: {
        'widest-xl': '0.24em',
      },
    },
  },
  plugins: [],
}

export default config
