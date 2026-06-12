/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0f0f11',
          1: '#18181b',
          2: '#242428',
          3: '#303036',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
        // Category colors — color = category, used consistently (design.md)
        cat: {
          strength: '#a78bfa', // violet-400 — Tonal strength sessions
          cardio: '#34d399',   // emerald-400 — Zone 2 / cardio
          rowing: '#38bdf8',   // sky-400 — rowing
          recovery: '#fb923c', // orange-400 — readiness / recovery
          pr: '#f472b6',       // pink-400 — PRs / bests
          body: '#a3e635',     // lime-400 — body maps / muscle state
          mixed: '#818cf8',    // indigo-400 — strength + cardio same day
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
