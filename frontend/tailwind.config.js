/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        zfBlue: '#0070BC',
        zfLightBlue: '#D1E9FF',
      },
    },
  },
  plugins: [],
}