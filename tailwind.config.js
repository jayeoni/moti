/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F4A7B9',
        secondary: '#B5D5C5',
        accent: '#FFD6A5',
        warning: '#FFB347',
        error: '#FF6B6B',
        cream: '#FFF9F5',
      },
    },
  },
  plugins: [],
};
