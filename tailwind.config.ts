import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#fff5f8",
          100: "#ffe4ec",
          200: "#ffc9d9",
          300: "#ff9dbb",
          400: "#ff6fa0",
          500: "#ff4785",
          600: "#ec2f6a",
          700: "#c8235a",
          800: "#96204a",
          900: "#62163c",
          950: "#3a0d25",
        },
      },
      fontFamily: {
        sans: ["Quicksand", "Comfortaa", "Nunito", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(236, 47, 106, 0.05), 0 4px 20px rgba(236, 47, 106, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
