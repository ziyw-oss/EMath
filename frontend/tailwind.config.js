/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-red-500",
    "hover:bg-red-600",
    "bg-blue-600",
    "hover:bg-blue-700",
    "bg-gray-300",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};