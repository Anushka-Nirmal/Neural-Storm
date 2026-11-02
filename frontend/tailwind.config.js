/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1C33',
          800: '#12315A', // Primary Navy
          700: '#1B4278',
          600: '#235599',
        },
        govblue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#155EEF', // Primary Blue
          700: '#1D4ED8',
        },
        govteal: {
          500: '#0F9D8A', // Secondary Teal
          600: '#0B7A6B',
        },
        saffron: {
          500: '#F28C28', // Accent Saffron
          600: '#D97316',
        },
        canvas: '#F5F8FC',
        surface: '#FFFFFF',
        govborder: '#DCE5F0',
        bodytext: '#152238',
        mutedtext: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
