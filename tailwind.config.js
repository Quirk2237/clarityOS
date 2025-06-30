/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class",
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				// Original shadcn colors (backwards compatibility)
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},

				// Duolingo-inspired colors
				duo: {
					// Primary Brand Colors
					primary: {
						DEFAULT: "#58CC02",
						50: "#F0FCE8",
						100: "#DDF9CC",
						200: "#BEF264",
						300: "#8DE639",
						400: "#58CC02",
						500: "#46A302",
						600: "#378002",
						700: "#2D6102",
						800: "#1F4102",
						900: "#132801",
					},
					// Secondary Colors
					secondary: {
						DEFAULT: "#1CB0F6",
						50: "#E8F8FF",
						100: "#CCF0FF",
						200: "#8DE0FF",
						300: "#4DD0FF",
						400: "#1CB0F6",
						500: "#0B7BC7",
						600: "#064B98",
						700: "#032F69",
						800: "#01183A",
						900: "#000C1B",
					},
					// Accent Colors
					gold: "#FFD900",
					orange: "#FF9600",
					red: "#FF4B4B",
					purple: "#CE82FF",
					pink: "#FF82B2",
					// Semantic Colors
					success: "#58CC02",
					warning: "#FFD900",
					error: "#FF4B4B",
					info: "#1CB0F6",
					// Neutral Colors
					gray: {
						50: "#F8F9FA",
						100: "#F1F3F4",
						200: "#E8EAED",
						300: "#DADCE0",
						400: "#BDC1C6",
						500: "#9AA0A6",
						600: "#80868B",
						700: "#5F6368",
						800: "#3C4043",
						900: "#202124",
					},
				},
			},
			fontSize: {
				// Typography scale from design tokens
				display: ["32px", { lineHeight: "40px", letterSpacing: "-0.5px" }],
				h1: ["28px", { lineHeight: "36px", letterSpacing: "-0.4px" }],
				h2: ["24px", { lineHeight: "32px", letterSpacing: "-0.3px" }],
				h3: ["20px", { lineHeight: "28px", letterSpacing: "-0.2px" }],
				h4: ["18px", { lineHeight: "26px" }],
				body: ["16px", { lineHeight: "24px" }],
				"body-small": ["14px", { lineHeight: "20px" }],
				button: ["16px", { lineHeight: "20px" }],
				caption: ["12px", { lineHeight: "16px", letterSpacing: "0.2px" }],
				overline: ["10px", { lineHeight: "12px", letterSpacing: "1px" }],
			},
			spacing: {
				// 8pt grid system
				xs: "4px",
				sm: "8px",
				md: "16px",
				lg: "24px",
				xl: "32px",
				"2xl": "48px",
				"3xl": "64px",
				"4xl": "96px",
			},
			borderRadius: {
				// Duolingo border radius scale
				sm: "8px",
				md: "12px",
				lg: "16px",
				xl: "24px",
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
