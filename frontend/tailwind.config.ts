import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Brand Colors - Updated to match new style guide
        brand: {
          // Backgrounds
          background: "#F9FAFB", // App background (gray-50)
          card: "#FFFFFF", // Card/sheet background
          border: "#E5E7EB", // Dividers/borders (gray-200)

          // Text colors (never use pure black)
          text: "#0F172A", // Main text (slate-900)
          "text-secondary": "#475569", // Secondary text (slate-600)
          "text-disabled": "#94A3B8", // Disabled/helper text (slate-400)

          // Accent color
          accent: "#2DD4BF", // Teal accent for buttons, active icons, progress
          "accent-hover": "#14B8A6", // Teal-500 for hover states

          // Signature element - Black floating oval bar
          oval: "#020617", // Slate-950 - NEVER change this

          // Status colors (minimal use)
          success: "#22C55E", // Green-500
          warning: "#F59E0B", // Amber-500
          error: "#EF4444", // Red-500
        },

        // Semantic accent colors
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf", // Brand accent
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
          DEFAULT: "#2DD4BF",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        logo: ["Playfair Display", "serif"],
        heading: ["Playfair Display", "serif"],
        body: ["Poppins", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
