/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				// ===========================================
				// NEW BRAND COLORS (Primary - use these)
				// ===========================================
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

				// Legacy: brand-primary for backwards compatibility
				"brand-primary": "#2DD4BF", // Maps to teal-400 (accent)

				// ===========================================
				// LEGACY ALIASES (for backwards compatibility)
				// These map old class names to new brand colors
				// TODO: Gradually migrate components to new classes
				// ===========================================
				offwhite: "#F9FAFB", // Legacy: now maps to gray-50
				"purple-primary": "#2DD4BF", // Legacy: now maps to teal-400 (accent)
				"blue-tertiary": "#14B8A6", // Legacy: now maps to teal-500

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

				// Keep existing shadcn colors for compatibility
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},
			fontFamily: {
				// Brand typography
				logo: ["Manrope", "sans-serif"], // Logo font
				heading: ["Manrope", "sans-serif"], // Headings
				body: ["Inter", "sans-serif"], // Body text
				sans: ["Inter", "sans-serif"], // Default sans
			},
			fontWeight: {
				logo: "700", // Bold for logo
				heading: "600", // SemiBold for headings
			},
			animation: {
				float: "float 3s ease-in-out infinite",
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar")({ nocompatible: true }),
	],
};
