// Brand colors - Primary brand identity
export const brandColors = {
	// Primary Brand Colors - New clean green
	primary: {
		DEFAULT: "#ACFF64", // Main brand color
		50: "#F7FFF0",
		100: "#EFFFDC",
		200: "#DEFFB8",
		300: "#CDFF94",
		400: "#BBFF70",
		500: "#ACFF64", // Main color
		600: "#8AE642",
		700: "#6FCE20",
		800: "#55B600",
		900: "#3A9E00",
	},

	// Secondary Colors - Clean blue
	secondary: {
		DEFAULT: "#1CB0F6", // Sky Blue
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
	accent: {
		orange: "#FF9600", // Energy/Warning
		red: "#FF4B4B", // Error/Danger
		purple: "#CE82FF", // Special/Premium
		yellow: "#FFD900", // Attention/Success
	},

	// Semantic Colors
	success: "#ACFF64", // Primary green
	warning: "#FF9600", // Orange
	error: "#FF4B4B", // Red
	info: "#1CB0F6", // Secondary blue

	// Neutral Colors - Clean grays
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
		900: "#292929",
	},

	// Main dark background color
	dark: "#292929",
};

// Typography scale - Modern, clean typeface hierarchy
export const typography = {
	// Font sizes with line heights - designed for readability
	display: { fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
	h1: { fontSize: 28, lineHeight: 36, letterSpacing: -0.4 },
	h2: { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
	h3: { fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
	h4: { fontSize: 18, lineHeight: 26 },
	body: { fontSize: 16, lineHeight: 24 },
	bodySmall: { fontSize: 14, lineHeight: 20 },
	button: { fontSize: 16, lineHeight: 20 },
	caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
	overline: { fontSize: 10, lineHeight: 12, letterSpacing: 1 },

	// Font weights
	weights: {
		regular: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},
};

// Spacing system - Consistent spacing scale
export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	"2xl": 48,
	"3xl": 64,
	"4xl": 96,
};

// Border radius scale - Modern, friendly rounded corners
export const borderRadius = {
	none: 0,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	"2xl": 24,
	full: 9999,
};

// Enhanced shadow system with clean, modern shadows
export const shadows = {
	// Standard shadows
	sm: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 4,
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
	},

	// Brand-specific shadows
	primary: {
		shadowColor: brandColors.primary[600],
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	secondary: {
		shadowColor: brandColors.secondary[600],
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	warning: {
		shadowColor: brandColors.accent.orange,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	error: {
		shadowColor: brandColors.accent.red,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},

	// Card shadows
	card: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
};

// Layout constants - Grid system and breakpoints
export const layout = {
	// Container max widths
	container: {
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280,
	},

	// Breakpoints for responsive design
	breakpoints: {
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280,
	},
};

// Enhanced color system
export const colorSystem = {
	background: brandColors.gray[50],
	foreground: brandColors.gray[900],
	card: "#FFFFFF",
	cardForeground: brandColors.gray[900],
	border: brandColors.gray[200],
	input: brandColors.gray[100],
	muted: brandColors.gray[100],
	mutedForeground: brandColors.gray[600],
	accent: brandColors.primary[50],
	accentForeground: brandColors.primary[900],
};

// Animation and timing constants
export const animation = {
	// Duration presets
	duration: {
		fast: 150,
		normal: 200,
		slow: 300,
		slower: 500,
	},

	// Easing functions
	easing: {
		linear: "linear",
		ease: "ease",
		easeIn: "ease-in",
		easeOut: "ease-out",
		easeInOut: "ease-in-out",
	},
};

// Color contrast helper for accessibility
export const getContrastColor = () => ({
	primary: brandColors.primary[600],
	secondary: brandColors.secondary[600],
	text: brandColors.gray[900],
	textMuted: brandColors.gray[600],
	background: brandColors.gray[50],
	surface: "#FFFFFF",
	border: brandColors.gray[200],
});
