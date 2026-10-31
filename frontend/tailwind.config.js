/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Authentic Indian Khata & Dukandaar Palette
        khata: {
          terracotta: '#B94F35',
          brick: '#A64D3D',
          mustard: '#D99A28',
          marigold: '#E8A04B',
          cream: '#F4E6CE',
          beige: '#D8BDA0',
          brown: '#76513B',
          charcoal: '#39332E',
          deepred: '#8A2A1A',
          gold: '#C98A2C',
        },
        // Formal Institutional / Bank Passport Palette
        bank: {
          navy: '#0A2540',
          dark: '#0F172A',
          header: '#1E293B',
          slate: '#334155',
          muted: '#64748B',
          light: '#94A3B8',
          subtle: '#E2E8F0',
          bg: '#F8FAFC',
          blue: '#1E40AF',
          accent: '#0284C7',
          steel: '#475569',
        },
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
        formal: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'paper-lift': '0 4px 16px -2px rgba(90, 62, 43, 0.08), 0 2px 6px -1px rgba(90, 62, 43, 0.04)',
        'paper-elevated': '0 12px 28px -4px rgba(90, 62, 43, 0.12), 0 4px 12px -2px rgba(90, 62, 43, 0.06)',
        'stamp-pressed': 'inset 0 1px 3px rgba(43, 38, 32, 0.25)',
        'report-card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'report-sheet': '0 10px 30px -5px rgba(15, 23, 42, 0.15), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
      },
      backgroundImage: {
        'ledger-grid': 'linear-gradient(to bottom, #D8BDA0 1px, transparent 1px)',
        'khata-lines': 'linear-gradient(to bottom, rgba(185, 79, 53, 0.15) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
