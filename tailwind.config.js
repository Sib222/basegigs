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
        primary: '#639922',
        'primary-dark': '#4d7a1a',
        'primary-light': '#e0eecb',
        secondary: '#0b2545',
        'secondary-light': '#1a3a63',
        sage: '#f4f7f2',
      },
    },
  },
  plugins: [],
}
