/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f3460",
        night: "#16213e",
        accent: "#e94560",
        surface: "#f4f4f8",
      },
    },
  },
  plugins: [],
};
