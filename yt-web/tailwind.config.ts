import type { Config } from "tailwindcss";

/**
 * Yanney Trends storefront — typography is intentionally unified on Poppins.
 * Legacy utility names (`font-playfair`, `font-bebas`, `font-jost`) all
 * resolve to the Poppins variable so the existing component classes keep
 * working without an audit while we migrate to a single typeface.
 */
const POPPINS_STACK = [
  "var(--font-poppins)",
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
] as const;

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Yanney Trends design tokens.
         * Surface, border, and ink colors point at CSS variables defined in
         * globals.css so they flip light/dark automatically when the `dark`
         * class is applied. Saturated brand colors (pink, status colors)
         * stay literal.
         */
        brand: {
          bg: "rgb(var(--surface-page-rgb) / <alpha-value>)",
          surface: "rgb(var(--surface-page-deep-rgb) / <alpha-value>)",
          elevated: "rgb(var(--surface-card-rgb) / <alpha-value>)",
          border: "rgb(var(--border-soft-rgb) / <alpha-value>)",
          pink: "#FF2E88",
          "pink-hover": "#FF4D9A",
          "pink-muted": "rgba(255, 46, 136, 0.1)",
          text: "rgb(var(--ink-strong-rgb) / <alpha-value>)",
          muted: "rgb(var(--ink-muted-rgb) / <alpha-value>)",
          dimmed: "rgb(var(--ink-dimmed-rgb) / <alpha-value>)",
          success: "#4ADE80",
          warning: "#FBBF24",
          danger: "#F87171",
          info: "#60A5FA",
        },
        surface: {
          dark: "#0c0c0c",
          "dark-elevated": "#141414",
        },
      },
      fontFamily: {
        sans: [...POPPINS_STACK],
        serif: [...POPPINS_STACK],
        playfair: [...POPPINS_STACK],
        bebas: [...POPPINS_STACK],
        jost: [...POPPINS_STACK],
        poppins: [...POPPINS_STACK],
      },
    },
  },
  plugins: [],
};
export default config;
