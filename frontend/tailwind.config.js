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
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			brand: {
    				background: '#F9FAFB',
    				card: '#FFFFFF',
    				border: '#E5E7EB',
    				text: '#0F172A',
    				'text-secondary': '#475569',
    				'text-disabled': '#94A3B8',
    				accent: '#2DD4BF',
    				'accent-hover': '#14B8A6',
    				oval: '#020617',
    				success: '#22C55E',
    				warning: '#F59E0B',
    				error: '#EF4444'
    			},
    			'brand-primary': '#2DD4BF',
    			offwhite: '#F9FAFB',
    			'purple-primary': '#2DD4BF',
    			'blue-tertiary': '#14B8A6',
    			accent: {
    				'50': '#f0fdfa',
    				'100': '#ccfbf1',
    				'200': '#99f6e4',
    				'300': '#5eead4',
    				'400': '#2dd4bf',
    				'500': '#14b8a6',
    				'600': '#0d9488',
    				'700': '#0f766e',
    				'800': '#115e59',
    				'900': '#134e4a',
    				'950': '#042f2e',
    				DEFAULT: '#2DD4BF',
    				foreground: '#FFFFFF'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		fontFamily: {
    			logo: [
    				'Quicksand',
    				'sans-serif'
    			],
    			heading: [
    				'Quicksand',
    				'sans-serif'
    			],
    			body: [
    				'Quicksand',
    				'sans-serif'
    			],
    			sans: [
    				'Quicksand',
    				'sans-serif'
    			]
    		},
    		fontWeight: {
    			logo: '700',
    			heading: '600'
    		},
    		animation: {
    			float: 'float 3s ease-in-out infinite',
    			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		keyframes: {
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0px)'
    				},
    				'50%': {
    					transform: 'translateY(-10px)'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		}
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar")({ nocompatible: true }),
	],
};
