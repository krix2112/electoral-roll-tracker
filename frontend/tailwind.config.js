export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        brand: {
          orange: "#f97316",
          green: "#22c55e",
          blue: "#3b82f6"
        },
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
