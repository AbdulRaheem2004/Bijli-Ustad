/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        nastaliq: [
          '"Noto Nastaliq Urdu"',
          '"Jameel Noori Nastaleeq"',
          '"Urdu Typesetting"',
          'serif',
        ],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#15803d',
          600: '#166534',
          700: '#14532d',
        },
        electric: {
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
};
