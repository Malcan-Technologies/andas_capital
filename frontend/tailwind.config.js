/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
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
				// Brand Colors - Updated to match style guide
				offwhite: "#F7F4EF", // Background Base
				"purple-primary": "#7C3AED", // Primary Brand Color
				"blue-tertiary": "#38BDF8", // Tertiary Accent Color

				// Brand object for compatibility
				brand: {
					primary: "#7C3AED", // Purple - Primary brand color
					accent: {
						from: "#7C3AED", // Purple
						to: "#38BDF8", // Blue
					},
					highlight: "#38BDF8", // Blue - CTA/Emphasis
					background: "#F7F4EF", // Off-white background
					text: "#374151", // Gray-700 for body text
					subtext: "#6B7280", // Gray-500 for subtext
				},
				// Semantic colors mapped to brand
				primary: {
					50: "#faf5ff",
					100: "#f3e8ff",
					200: "#e9d5ff",
					300: "#d8b4fe",
					400: "#c084fc",
					500: "#a855f7",
					600: "#9333ea",
					700: "#7c3aed", // Brand primary
					800: "#6b21a8",
					900: "#581c87",
					950: "#3b0764",
					DEFAULT: "#7C3AED",
					foreground: "#F7F4EF",
				},
				accent: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8", // Blue tertiary
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49",
					DEFAULT: "#38BDF8",
					foreground: "#374151",
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
			backgroundImage: {
				"brand-gradient":
					"linear-gradient(135deg, #7C3AED 0%, #38BDF8 100%)",
				"brand-gradient-hover":
					"linear-gradient(135deg, #6B21A8 0%, #0284C7 100%)",
				"accent-gradient":
					"linear-gradient(135deg, #38BDF8 0%, #7C3AED 100%)",
			},
			animation: {
				gradient: "gradient 6s ease infinite",
				float: "float 3s ease-in-out infinite",
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				gradient: {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
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
