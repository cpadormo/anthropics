import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#dbe5f2",
          200: "#b6cae5",
          300: "#88a7d2",
          400: "#5b85bf",
          500: "#3a67a8",
          600: "#2c5189",
          700: "#22406d",
          800: "#1a3155",
          900: "#0f1f3a",
          950: "#070f1f",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 31, 58, 0.04), 0 4px 16px rgba(15, 31, 58, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
