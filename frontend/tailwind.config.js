/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/tailwind-datepicker-react/dist/**/*.js',
    './node_modules/react-tailwindcss-select/dist/index.esm.js',
  ],
  theme: {
    extend: {
      boxShadow: {
        tbrow: '0 -4px 8px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        grotesk: ['grotesk', 'sans-serif'],
      },
      fontSize: {
        md: '16px',
        xss: '10px',
      },
    },
  },
  plugins: [require('@ceol/tailwind-tooltip')],
};
