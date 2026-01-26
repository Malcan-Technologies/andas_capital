/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Brand Colors
				brand: {
					primary: "#14B8A6", // Teal - Primary text color
					accent: {
						from: "#14B8A6", // Teal
						to: "#3B82F6", // Blue
					},
					highlight: "#22D3EE", // Cyan - CTA/Emphasis
					background: "#0F172A", // Deep slate
					text: {
						light: "#F8FAFC", // Near-white for dark mode
					},
				},
				// Semantic colors mapped to brand
				primary: {
					50: "#f0fdfa",
					100: "#ccfbf1",
					200: "#99f6e4",
					300: "#5eead4",
					400: "#2dd4bf",
					500: "#14b8a6", // Brand primary
					600: "#0d9488",
					700: "#0f766e",
					800: "#115e59",
					900: "#134e4a",
					950: "#042f2e",
					DEFAULT: "#14B8A6",
				},
				accent: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49",
					DEFAULT: "#22D3EE",
				},
			},
		fontFamily: {
			// Brand typography
			logo: ["var(--font-rethink-sans)", "Rethink Sans", "sans-serif"], // Logo font
			heading: ["var(--font-rethink-sans)", "Rethink Sans", "sans-serif"], // Headings
			body: ["var(--font-inter)", "Inter", "sans-serif"], // Body text
			sans: ["var(--font-inter)", "Inter", "sans-serif"], // Default sans
		},
		fontWeight: {
			logo: "600", // SemiBold for logo
			heading: "500", // Medium for headings
		},
			backgroundImage: {
				"brand-gradient":
					"linear-gradient(135deg, #14B8A6 0%, #3B82F6 100%)",
				"brand-gradient-hover":
					"linear-gradient(135deg, #0d9488 0%, #2563eb 100%)",
				"accent-gradient":
					"linear-gradient(135deg, #22D3EE 0%, #14B8A6 100%)",
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
	plugins: [require("@tailwindcss/forms")],
};
