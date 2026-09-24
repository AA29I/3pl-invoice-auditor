import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Mett Global Observed Palette
        "near-black": "#090908",
        ink: "#121210",
        "warm-paper": "#FBFAF6",
        cream: "#F3F0E8",
        "primary-gold": "#B8892D",
        "light-gold": "#E0BC68",
        "muted-text": "#777268",
        "border-mett": "#DCD5C8",
        // Extended functional palette harmonized with Mett Global
        mett: {
          dark: "#090908",
          ink: "#121210",
          paper: "#FBFAF6",
          cream: "#F3F0E8",
          gold: "#B8892D",
          lightGold: "#E0BC68",
          muted: "#777268",
          border: "#DCD5C8",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
