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
      },
    },
  },
  plugins: [],
}
