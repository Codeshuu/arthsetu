/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0F2E22',
          800: '#14402F',
          600: '#2A6347',
          100: '#DCE8DD',
        },
        olive: {
          600: '#6B7A3A',
          400: '#939F5B',
        },
        sage: {
          300: '#B7C4A0',
          100: '#E4EAD6',
        },
        ivory: {
          50: '#FDFBF4',
        },
        cream: {
          100: '#F8F1DE',
        },
        paper: {
          200: '#F1E8D0',
          300: '#E6DAB9',
        },
        beige: {
          400: '#D9CBA3',
        },
        saffron: {
          500: '#D08A1E',
          600: '#B57415',
        },
        gold: {
          700: '#7A5A16',
          500: '#B28A33',
          200: '#E8D6A3',
        },
        terracotta: {
          500: '#B5532F',
          200: '#E8C3B0',
        },
        brown: {
          700: '#5A3E2B',
          500: '#8A6446',
        },
        ink: {
          900: '#2B2620',
          700: '#4B4740',
        },
        stone: {
          500: '#7C766B',
          300: '#C9C3B5',
        },
        rule: '#D6CAA8',
      },
      fontFamily: {
        display: ['Fraunces', '"Noto Sans Devanagari"', '"Noto Sans Kannada"', '"Noto Sans Tamil"', 'serif'],
        sans: ['Manrope', '"Noto Sans Devanagari"', '"Noto Sans Kannada"', '"Noto Sans Tamil"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        handwriting: ['Kalam', 'cursive'],
        hindiDisplay: ['"Tiro Devanagari Hindi"', 'serif'],
        hindiBody: ['"Noto Sans Devanagari"', 'sans-serif'],
        kannadaBody: ['"Noto Sans Kannada"', 'sans-serif'],
        tamilBody: ['"Noto Sans Tamil"', 'sans-serif'],
      },
      boxShadow: {
        'paper-lift': '0 4px 16px -2px rgba(90, 62, 43, 0.08), 0 2px 6px -1px rgba(90, 62, 43, 0.04)',
        'paper-elevated': '0 12px 28px -4px rgba(90, 62, 43, 0.12), 0 4px 12px -2px rgba(90, 62, 43, 0.06)',
        'stamp-pressed': 'inset 0 1px 3px rgba(43, 38, 32, 0.25)',
      },
      backgroundImage: {
        'ledger-grid': 'linear-gradient(to bottom, #D6CAA8 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}

