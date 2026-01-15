/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}',
    './src/data/**/*.json' // Add this line for your shops and blogs data
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};