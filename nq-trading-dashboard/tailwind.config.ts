import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#06080d",
          panel: "#0b0f17",
          elevated: "#10151f",
        },
        text: {
          primary: "#e6edf6",
          secondary: "#9aa6b8",
          muted: "#5e6a7c",
        },
        bull: { DEFAULT: "#22c55e", soft: "rgba(34,197,94,0.12)" },
        bear: { DEFAULT: "#ef4444", soft: "rgba(239,68,68,0.12)" },
        warn: { DEFAULT: "#f59e0b", soft: "rgba(245,158,11,0.12)" },
        info: { DEFAULT: "#38bdf8", soft: "rgba(56,189,248,0.12)" },
        accent: { DEFAULT: "#7c5cff", soft: "rgba(124,92,255,0.12)" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 30px 60px -30px rgba(0,0,0,0.6)",
        glow: "0 0 30px rgba(124,92,255,0.25)",
      },
      animation: {
        pulseSoft: "pulseSoft 2.5s ease-in-out infinite",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
