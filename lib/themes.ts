export type ThemeColors = {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textSoft: string;
  accent: string;
  accentSoft: string;
};

export type Theme = {
  id: string;
  name: string;
  emoji: string;
  light: ThemeColors;
  dark: ThemeColors;
};

export const themes: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "💼",
    light: {
      bg: "#f7f9fc",
      surface: "#ffffff",
      border: "#e5eaf2",
      text: "#0f1f3a",
      textSoft: "#475569",
      accent: "#22406d",
      accentSoft: "#dbe5f2",
    },
    dark: {
      bg: "#070f1f",
      surface: "#0f1f3a",
      border: "#1a3155",
      text: "#f0f4fa",
      textSoft: "#88a7d2",
      accent: "#5b85bf",
      accentSoft: "#1a3155",
    },
  },
  {
    id: "hello-kitty",
    name: "Hello Kitty",
    emoji: "🎀",
    light: {
      bg: "#fef8fa",
      surface: "#ffffff",
      border: "#ffd1e0",
      text: "#62163c",
      textSoft: "#96204a",
      accent: "#ec2f6a",
      accentSoft: "#ffe4ec",
    },
    dark: {
      bg: "#2a0a1a",
      surface: "#3a0d25",
      border: "#62163c",
      text: "#fff5f8",
      textSoft: "#ffc9d9",
      accent: "#ff9dbb",
      accentSoft: "#62163c",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    light: {
      bg: "#f0f8ff",
      surface: "#ffffff",
      border: "#cfe4f5",
      text: "#0c3a5f",
      textSoft: "#3d6e94",
      accent: "#0284c7",
      accentSoft: "#e0f2fe",
    },
    dark: {
      bg: "#0c1a2e",
      surface: "#122d4f",
      border: "#1e4b7d",
      text: "#e0f2fe",
      textSoft: "#7dd3fc",
      accent: "#38bdf8",
      accentSoft: "#1e3a5f",
    },
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    light: {
      bg: "#f0f9f2",
      surface: "#ffffff",
      border: "#c8e6d3",
      text: "#14532d",
      textSoft: "#3f7d5c",
      accent: "#16a34a",
      accentSoft: "#dcfce7",
    },
    dark: {
      bg: "#0a1f13",
      surface: "#143622",
      border: "#245e37",
      text: "#dcfce7",
      textSoft: "#86efac",
      accent: "#4ade80",
      accentSoft: "#1b4d2c",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    light: {
      bg: "#fff7ed",
      surface: "#ffffff",
      border: "#fed7aa",
      text: "#7c2d12",
      textSoft: "#9a3412",
      accent: "#ea580c",
      accentSoft: "#ffedd5",
    },
    dark: {
      bg: "#250e00",
      surface: "#3d1804",
      border: "#7c2d12",
      text: "#ffedd5",
      textSoft: "#fdba74",
      accent: "#fb923c",
      accentSoft: "#5a1f08",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💜",
    light: {
      bg: "#faf5ff",
      surface: "#ffffff",
      border: "#e9d5ff",
      text: "#4c1d95",
      textSoft: "#6d28d9",
      accent: "#7c3aed",
      accentSoft: "#ede9fe",
    },
    dark: {
      bg: "#1a0d33",
      surface: "#2e1065",
      border: "#4c1d95",
      text: "#ede9fe",
      textSoft: "#c4b5fd",
      accent: "#a78bfa",
      accentSoft: "#4c1d95",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "⚡",
    light: {
      bg: "#0a0a0f",
      surface: "#141420",
      border: "#ff006e",
      text: "#f0abfc",
      textSoft: "#ec4899",
      accent: "#00ffff",
      accentSoft: "#1a0033",
    },
    dark: {
      bg: "#0a0a0f",
      surface: "#141420",
      border: "#ff006e",
      text: "#f0abfc",
      textSoft: "#ec4899",
      accent: "#00ffff",
      accentSoft: "#1a0033",
    },
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    emoji: "⭐",
    light: {
      bg: "#0a0a0a",
      surface: "#1a1a1a",
      border: "#78350f",
      text: "#fef3c7",
      textSoft: "#fbbf24",
      accent: "#eab308",
      accentSoft: "#422006",
    },
    dark: {
      bg: "#0a0a0a",
      surface: "#1a1a1a",
      border: "#78350f",
      text: "#fef3c7",
      textSoft: "#fbbf24",
      accent: "#eab308",
      accentSoft: "#422006",
    },
  },
  {
    id: "y2k",
    name: "Y2K Chrome",
    emoji: "💿",
    light: {
      bg: "#e0e7ff",
      surface: "#ffffff",
      border: "#a5b4fc",
      text: "#1e3a8a",
      textSoft: "#3730a3",
      accent: "#4f46e5",
      accentSoft: "#dbeafe",
    },
    dark: {
      bg: "#0f172a",
      surface: "#1e293b",
      border: "#475569",
      text: "#dbeafe",
      textSoft: "#93c5fd",
      accent: "#818cf8",
      accentSoft: "#312e81",
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    light: {
      bg: "#faf6f1",
      surface: "#ffffff",
      border: "#d6c5a8",
      text: "#3d2817",
      textSoft: "#78350f",
      accent: "#92400e",
      accentSoft: "#fef3c7",
    },
    dark: {
      bg: "#1c1408",
      surface: "#292118",
      border: "#4a3520",
      text: "#fef3c7",
      textSoft: "#fbbf24",
      accent: "#d97706",
      accentSoft: "#422006",
    },
  },
];

export const DEFAULT_THEME_ID = "classic";

export function findTheme(id: string | null | undefined): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
