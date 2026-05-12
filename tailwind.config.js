/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // V2 palette
        paper:     '#F6F2E9',
        'paper-deep': '#EAE3D2',
        ink:       '#161513',
        red:       '#D8392B',

        // Aliases kept so existing className references keep compiling
        primary:   '#D8392B',
        secondary: '#161513',
        accent:    '#EAE3D2',
        warning:   '#D8392B',
        error:     '#D8392B',
        cream:     '#F6F2E9',
      },
      fontFamily: {
        serif:   ['Newsreader_500Medium'],
        stencil: ['BebasNeue_400Regular'],
        mono:    ['IBMPlexMono_500Medium'],
      },
    },
  },
  plugins: [],
};
