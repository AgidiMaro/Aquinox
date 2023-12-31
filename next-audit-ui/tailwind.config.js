/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      colors: {
        pureWhite: '#FFFFFF',
        darkBlue: '#1C73DA',
        lightWhite: '#F3F3F3'
      }
    },
  },
  plugins: [],
}