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
      backgroundColor: {
        tbrow: '#4A4686',
      },
      colors: {
        black: '#181818',
        neutral: {
          2: '#FAFAFA',
          5: '#D1D1D6',
          4: '#E4E4E7',
          6: '#A0A0AB',
          8: '#51525C',
          7: '#70707B',
          9: '#3F3F46',
          10: '#26272B',
          11: '#E7E5E4',
        },
        teal: '#1F6C99',
        red: '#E53344',
        yellow: '#FFCC00',
        green: '#339900',
        grey: '#F4F4F4',
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
