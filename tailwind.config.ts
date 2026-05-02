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
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fc',
          400: '#36a8f8',
          500: '#0c8ce9',
          600: '#006fc7',
          700: '#0158a1',
          800: '#064b85',
          900: '#0b3f6e',
          950: '#072849',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        warm: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // ── Paper Diary palette ─────────────────────────────────────
        pd: {
          paper:      '#efe9dc',
          'paper-lt': '#f6f1e5',
          'paper-white': '#fdfbf4',
          ink:        '#1a1a1a',
          'ink-soft': '#3a3a3a',
          'ink-muted':'#6b6558',
          rule:       '#d9d1bf',
          'rule-soft':'#e6dfcb',
          margin:     '#c76a54',
          accent:     '#2e5fa1',
          amber:      '#c59a3a',
          moss:       '#6d8862',
          coral:      '#c76a54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        'pd-display': ['"Inter Tight"', 'system-ui', 'sans-serif'],
        'pd-body':    ['Inter', 'system-ui', 'sans-serif'],
        'pd-hand':    ['Caveat', '"Bradley Hand"', 'cursive'],
        'pd-mono':    ['ui-monospace', '"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'pd-paper': "repeating-linear-gradient(0deg, transparent 0 27px, rgba(0,0,0,0.03) 27px 28px)",
      },
    },
  },
  plugins: [],
}
export default config
