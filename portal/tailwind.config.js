/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#07111f",
        surface: "#0b1524",
        line: "rgba(255,255,255,0.10)"
      },
      boxShadow: {
        glow: "0 0 60px rgba(56,189,248,0.12)"
      }
    }
  },
  plugins: []
};
