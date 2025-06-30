import { duolingoColors } from "@/constants/colors";

// Typography system
export const typography = {
	// Display Text
	display: {
		fontSize: 32,
		fontWeight: "700" as const,
		lineHeight: 40,
		letterSpacing: -0.5,
	},

	// Headings
	h1: {
		fontSize: 28,
		fontWeight: "700" as const,
		lineHeight: 36,
		letterSpacing: -0.4,
	},
	h2: {
		fontSize: 24,
		fontWeight: "600" as const,
		lineHeight: 32,
		letterSpacing: -0.3,
	},
	h3: {
		fontSize: 20,
		fontWeight: "600" as const,
		lineHeight: 28,
		letterSpacing: -0.2,
	},
	h4: {
		fontSize: 18,
		fontWeight: "600" as const,
		lineHeight: 26,
	},

	// Body Text
	body: {
		fontSize: 16,
		fontWeight: "400" as const,
		lineHeight: 24,
	},
	bodyMedium: {
		fontSize: 16,
		fontWeight: "500" as const,
		lineHeight: 24,
	},
	bodySmall: {
		fontSize: 14,
		fontWeight: "400" as const,
		lineHeight: 20,
	},

	// UI Text
	button: {
		fontSize: 16,
		fontWeight: "700" as const,
		lineHeight: 20,
	},
	caption: {
		fontSize: 12,
		fontWeight: "400" as const,
		lineHeight: 16,
		letterSpacing: 0.2,
	},
	overline: {
		fontSize: 10,
		fontWeight: "600" as const,
		lineHeight: 12,
		letterSpacing: 1,
	},
};

// Spacing scale (8pt grid system)
export const spacing = {
	xs: 4, // 0.25rem
	sm: 8, // 0.5rem
	md: 16, // 1rem
	lg: 24, // 1.5rem
	xl: 32, // 2rem
	"2xl": 48, // 3rem
	"3xl": 64, // 4rem
	"4xl": 96, // 6rem
};

// Animation system with enhanced Duolingo-style animations
export const animations = {
	// Standard durations (in milliseconds)
	fast: 150,
	normal: 250,
	slow: 400,

	// Easing curves
	easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
	easeIn: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
	easeInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
	bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

	// Duolingo-specific animations
	buttonPress: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
	popIn: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

// Border radius scale with Duolingo styling
export const radius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	full: 9999,

	// Duolingo-specific radius
	button: 12,
	card: 16,
};

// Enhanced shadow system with Duolingo-style hard shadows
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

	// Duolingo-style hard shadows
	duolingoHard: {
		shadowColor: duolingoColors.primary[600],
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 6,
	},
	duolingoSecondary: {
		shadowColor: duolingoColors.secondary[600],
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 6,
	},
	duolingoWarning: {
		shadowColor: "#D97706", // Yellow-600
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 6,
	},
	duolingoError: {
		shadowColor: "#DC2626", // Red-600
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 6,
	},

	// Card shadows with theme support
	cardLight: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	cardDark: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 6,
	},
};

// Z-index scale
export const zIndex = {
	base: 0,
	dropdown: 1000,
	sticky: 1020,
	fixed: 1030,
	modalBackdrop: 1040,
	modal: 1050,
	popover: 1060,
	tooltip: 1070,
};

// Container widths
export const containers = {
	sm: 375, // Mobile
	md: 768, // Tablet
	lg: 1024, // Desktop
	xl: 1280, // Large Desktop
};

// Enhanced color system with dark mode variants
export const colorSystem = {
	light: {
		background: duolingoColors.gray[50],
		foreground: duolingoColors.gray[900],
		card: "#FFFFFF",
		cardForeground: duolingoColors.gray[900],
		border: duolingoColors.gray[200],
		input: duolingoColors.gray[100],
		muted: duolingoColors.gray[100],
		mutedForeground: duolingoColors.gray[600],
		accent: duolingoColors.primary[50],
		accentForeground: duolingoColors.primary[900],
	},
	dark: {
		background: duolingoColors.gray[900],
		foreground: duolingoColors.gray[50],
		card: duolingoColors.gray[800],
		cardForeground: duolingoColors.gray[50],
		border: duolingoColors.gray[700],
		input: duolingoColors.gray[800],
		muted: duolingoColors.gray[800],
		mutedForeground: duolingoColors.gray[400],
		accent: duolingoColors.primary[900],
		accentForeground: duolingoColors.primary[50],
	},
};

// Consolidated design tokens
export const designTokens = {
	colors: duolingoColors,
	colorSystem,
	typography,
	spacing,
	animations,
	radius,
	shadows,
	zIndex,
	containers,
};

// Utility functions for responsive design
export const breakpoints = {
	sm: `(min-width: ${containers.sm}px)`,
	md: `(min-width: ${containers.md}px)`,
	lg: `(min-width: ${containers.lg}px)`,
	xl: `(min-width: ${containers.xl}px)`,
};

// Animation helpers with accessibility consideration
export const getAnimationDuration = (prefersReducedMotion: boolean) => ({
	fast: prefersReducedMotion ? 0 : animations.fast,
	normal: prefersReducedMotion ? 0 : animations.normal,
	slow: prefersReducedMotion ? 0 : animations.slow,
});

export const getScaleValue = (prefersReducedMotion: boolean, scale = 1.05) =>
	prefersReducedMotion ? 1 : scale;

// Theme-aware shadow helper
export const getThemeShadow = (
	isDark: boolean,
	shadowType: "card" | "button" = "card",
) => {
	if (shadowType === "button") {
		return isDark ? shadows.duolingoHard : shadows.duolingoHard;
	}
	return isDark ? shadows.cardDark : shadows.cardLight;
};

// Color contrast helper for better accessibility
export const getContrastColor = (isDark: boolean) => ({
	primary: isDark ? duolingoColors.primary[400] : duolingoColors.primary[600],
	secondary: isDark
		? duolingoColors.secondary[400]
		: duolingoColors.secondary[600],
	text: isDark ? duolingoColors.gray[100] : duolingoColors.gray[900],
	textMuted: isDark ? duolingoColors.gray[400] : duolingoColors.gray[600],
	background: isDark ? duolingoColors.gray[900] : duolingoColors.gray[50],
	surface: isDark ? duolingoColors.gray[800] : "#FFFFFF",
	border: isDark ? duolingoColors.gray[700] : duolingoColors.gray[200],
});
