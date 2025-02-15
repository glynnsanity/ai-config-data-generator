
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        launchdarkly: {
          blue: '#556cfe',
          green: '#8ae8b5',
          pink: '#f63880',
        },
      },
    },
  },
  plugins: [],
};