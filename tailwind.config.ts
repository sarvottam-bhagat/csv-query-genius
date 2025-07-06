import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Custom Game of Thrones colors
				'ice-blue': 'hsl(var(--ice-blue))',
				'ice-blue-glow': 'hsl(var(--ice-blue-glow))',
				'steel-gray': 'hsl(var(--steel-gray))',
				'winter-night': 'hsl(var(--winter-night))',
				'frost-white': 'hsl(var(--frost-white))'
			},
			backgroundImage: {
				'gradient-ice': 'var(--gradient-ice)',
				'gradient-steel': 'var(--gradient-steel)',
				'gradient-night': 'var(--gradient-night)',
				'gradient-glow': 'var(--gradient-glow)'
			},
			boxShadow: {
				'ice': 'var(--shadow-ice)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				},
				// Ice and winter themed animations
				'ice-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(200 100% 70% / 0.4)',
						transform: 'scale(1)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(200 100% 85% / 0.6)',
						transform: 'scale(1.02)'
					}
				},
				'frost-glow': {
					'0%, 100%': {
						filter: 'drop-shadow(0 0 10px hsl(200 100% 70% / 0.3))'
					},
					'50%': {
						filter: 'drop-shadow(0 0 20px hsl(200 100% 85% / 0.5))'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'ice-pulse': 'ice-pulse 3s ease-in-out infinite',
				'frost-glow': 'frost-glow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.4s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
