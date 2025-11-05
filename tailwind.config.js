/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'rollbar': {
          'bg-dark': '#282F3E',
          'bg-header': '#29303F',
          'bg-card': '#30384B',
          'border': '#343F55',
          'yellow': '#EBB74E',
          'blue': '#4484FF',
          'gray-text': '#5E6D8C',
          'green': '#10b981',
          'red': '#ef4444',
        }
      },
      fontFamily: {
        'header': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
