/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'button-pulse': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.9',
            transform: 'scale(1.05)',
          },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
        'button-pulse': 'button-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};