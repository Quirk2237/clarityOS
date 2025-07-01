/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./lib/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				// HSL color space for CSS variables
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
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",

				// Brand colors - ClarityOS vibrant palette
				brand: {
					// Primary Colors
					primary: {
						vibrantGreen: "#ACFF64",
						neonGreen: "#7EFF7E",
						vibrantPink: "#FF69B4",
						hotPink: "#FF1493",
					},
					// Neutral Colors
					neutrals: {
						darkBackground: "#1A1A1A",
						cardBackground: "#FFFFFF",
						textPrimary: "#000000",
						textSecondary: "#666666",
						iconGray: "#999999",
					},
					// Accent Colors
					accent: {
						yellow: "#FFD700",
						orange: "#FFA500",
					},
					// Semantic Colors
					success: "#ACFF64", // Vibrant green
					warning: "#FFA500", // Orange
					error: "#FF1493", // Hot pink
					info: "#7EFF7E", // Neon green
				},
			},
			fontSize: {
				// Typography scale from ClarityOS design system
				title: ["24px", { lineHeight: "32px", letterSpacing: "-0.3px" }],
				subtitle: ["16px", { lineHeight: "24px", letterSpacing: "-0.2px" }],
				body: ["14px", { lineHeight: "20px" }],
				caption: ["12px", { lineHeight: "16px", letterSpacing: "0.2px" }],
			},
			fontFamily: {
				// SF Pro Display font family
				sans: ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
				"sans-medium": ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
				"sans-semibold": ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
				"sans-bold": ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
			},
			spacing: {
				// ClarityOS spacing scale
				xs: "4px",
				sm: "8px",
				md: "16px",
				lg: "24px",
				xl: "32px",
				xxl: "48px",
			},
			borderRadius: {
				// ClarityOS border radius scale
				small: "8px",
				medium: "16px",
				large: "24px",
				full: "9999px",
			},
			animation: {
				// Custom animations
				"bounce-gentle":
					"bounce-gentle 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
				"scale-press": "scale-press 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
			},
			keyframes: {
				"bounce-gentle": {
					"0%, 100%": { transform: "scale(1)" },
					"50%": { transform: "scale(1.1)" },
				},
				"scale-press": {
					"0%": { transform: "scale(1)" },
					"100%": { transform: "scale(0.98)" },
				},
			},
		},
	},
	plugins: [],
};
