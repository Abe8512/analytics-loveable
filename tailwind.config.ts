
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
					foreground: 'hsl(var(--primary-foreground))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Advanced AI-inspired color palette
				"ai-blue": "#00C2FF",
				"ai-indigo": "#7B61FF",
				"ai-purple": "#B54EFF",
				"ai-fuchsia": "#FF00E5",
				"ai-rose": "#FF5286",
				"ai-cyan": "#00FFCC",
				"ai-teal": "#00D0B9",
				"ai-lime": "#B3FF00",
				"ai-orange": "#FF7A39",
				"ai-yellow": "#FFD600",
				// Dark surfaces
				"surface-dark": "#0B0F19",
				"surface-dark-hover": "#10151F",
				"surface-dark-active": "#171D2A",
				"surface-darker": "#060A12",
				"surface-darkest": "#030508",
				// Light surfaces
				"surface-light": "#F6F8FC",
				"surface-light-hover": "#EDF1FA",
				"surface-light-active": "#E5EAF5",
				"surface-lighter": "#FFFFFF",
				"surface-lightest": "#FFFFFF"
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'neon-blue': '0 0 8px 0 rgba(0, 194, 255, 0.5)',
				'neon-purple': '0 0 8px 0 rgba(181, 78, 255, 0.5)',
				'neon-fuchsia': '0 0 8px 0 rgba(255, 0, 229, 0.5)',
				'neon-teal': '0 0 8px 0 rgba(0, 208, 185, 0.5)',
				'neon-lime': '0 0 8px 0 rgba(179, 255, 0, 0.5)',
				'ai-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
				'ai-card': '0 4px 20px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
				'ai-dropdown': '0 4px 20px rgba(0, 0, 0, 0.15)',
				'ai-inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px 0 rgba(0, 194, 255, 0.3)' },
					'50%': { boxShadow: '0 0 20px 0 rgba(0, 194, 255, 0.6)' }
				},
				'waveform': {
					'0%': { height: '5px' },
					'50%': { height: '20px' },
					'100%': { height: '5px' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'matrix-rain': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'ripple': {
					'0%': { transform: 'scale(0.95)', opacity: '0.8' },
					'50%': { transform: 'scale(1.05)', opacity: '0.5' },
					'100%': { transform: 'scale(0.95)', opacity: '0.8' }
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'waveform': 'waveform 1.5s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 3s infinite linear',
				'matrix-rain': 'matrix-rain 15s linear infinite',
				'rotate-slow': 'rotate-slow 10s linear infinite',
				'ripple': 'ripple 3s infinite ease-in-out',
				'blink': 'blink 2s infinite',
				'gradient-shift': 'gradient-shift 5s infinite'
			},
			backdropBlur: {
				xs: '2px'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-ai': 'linear-gradient(135deg, var(--ai-gradient-start), var(--ai-gradient-end))',
				'grid-pattern': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
				'dot-pattern': 'radial-gradient(rgba(142, 142, 142, 0.1) 1px, transparent 0)',
				'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
				'cyber-grid': 'linear-gradient(to right, rgba(30, 144, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 144, 255, 0.05) 1px, transparent 1px)',
			},
			backgroundSize: {
				'auto': 'auto',
				'cover': 'cover',
				'contain': 'contain',
				'grid-pattern': '20px 20px',
				'dot-pattern': '20px 20px',
				'cyber-grid': '30px 30px'
			},
			fontFamily: {
				'mono': ['JetBrains Mono', 'monospace'],
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'display': ['Manrope', 'sans-serif']
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						color: 'var(--tw-prose-body)',
						'[class~="lead"]': {
							color: 'var(--tw-prose-lead)'
						},
						a: {
							color: 'var(--tw-prose-links)',
							textDecoration: 'underline',
							textUnderlineOffset: '2px',
							'&:hover': {
								color: 'var(--tw-prose-links-hover)'
							}
						},
						strong: {
							color: 'var(--tw-prose-bold)',
							fontWeight: '600'
						},
						code: {
							color: 'var(--tw-prose-code)',
							borderRadius: '0.25rem',
							paddingTop: '0.15rem',
							paddingRight: '0.25rem',
							paddingBottom: '0.15rem',
							paddingLeft: '0.25rem',
							backgroundColor: 'var(--tw-prose-code-bg)'
						},
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						},
						pre: {
							color: 'var(--tw-prose-pre-code)',
							backgroundColor: 'var(--tw-prose-pre-bg)',
							borderRadius: '0.375rem',
							padding: '1rem',
							overflowX: 'auto'
						}
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
