/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a1a',
          secondary: '#12122a',
          card: '#1a1a3a',
        },
        brand: {
          red: '#ff4444',
          'red-dark': '#cc3333',
          gold: '#ffd700',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0cc',
        },
        border: '#2a2a4a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
