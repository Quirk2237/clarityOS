// Brand colors - ClarityOS vibrant palette
export const brandColors = {
	// Primary Brand Colors - Vibrant ClarityOS palette
	primary: {
		vibrantGreen: "#9AFF9A",
		neonGreen: "#7EFF7E",
		vibrantPink: "#FF69B4",
		hotPink: "#FF1493",
	},

	// Neutral Colors - Clean grays with dark background
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
	success: "#9AFF9A", // Vibrant green
	warning: "#FFA500", // Orange
	error: "#FF1493", // Hot pink
	info: "#7EFF7E", // Neon green
};

// Typography scale - SF Pro Display based
export const typography = {
	// Font sizes with line heights - designed for readability
	title: { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
	subtitle: { fontSize: 16, lineHeight: 24, letterSpacing: -0.2 },
	body: { fontSize: 14, lineHeight: 20 },
	caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },

	// Font weights
	weights: {
		regular: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},

	// Line heights
	lineHeights: {
		tight: 1.2,
		normal: 1.4,
		relaxed: 1.6,
	},
};

// Spacing system - Consistent spacing scale
export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
};

// Border radius scale - Modern, friendly rounded corners
export const borderRadius = {
	small: 8,
	medium: 16,
	large: 24,
	full: 9999,
};

// Enhanced shadow system with clean, modern shadows
export const shadows = {
	// Standard shadows
	card: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 3,
	},
	elevated: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 8,
	},
};

// Layout constants - Mobile optimized
export const layout = {
	// Mobile viewport
	mobileViewport: {
		width: 375,
		height: 812,
	},

	// Safe area
	safeArea: {
		top: 44,
		bottom: 34,
	},

	// Status bar
	statusBar: {
		height: 44,
		backgroundColor: "transparent",
		textColor: "white",
	},

	// Tab bar
	tabBar: {
		height: 83,
		backgroundColor: "#1A1A1A",
		iconSize: 24,
	},
};

// Enhanced color system
export const colorSystem = {
	background: brandColors.neutrals.darkBackground,
	foreground: brandColors.neutrals.textPrimary,
	card: brandColors.neutrals.cardBackground,
	cardForeground: brandColors.neutrals.textPrimary,
	popover: brandColors.neutrals.cardBackground,
	popoverForeground: brandColors.neutrals.textPrimary,
	primary: brandColors.primary.vibrantGreen,
	primaryForeground: brandColors.neutrals.textPrimary,
	secondary: brandColors.primary.neonGreen,
	secondaryForeground: brandColors.neutrals.textPrimary,
	muted: brandColors.neutrals.textSecondary,
	mutedForeground: brandColors.neutrals.iconGray,
	accent: brandColors.primary.vibrantPink,
	accentForeground: "#FFFFFF",
	destructive: brandColors.primary.hotPink,
	destructiveForeground: "#FFFFFF",
	border: brandColors.neutrals.textSecondary,
	input: brandColors.neutrals.textSecondary,
	ring: brandColors.primary.vibrantGreen,
};

// Component-specific tokens
export const componentTokens = {
	appHeader: {
		structure: "Centered app name with status bar overlay",
		typography: "Medium weight, white text",
		positioning: "Fixed at top with safe area padding",
	},

	cardContainer: {
		structure: "Full-width rounded container with vibrant background",
		backgroundColor: "Primary vibrant colors (green/pink)",
		borderRadius: "large (24px)",
		padding: "lg (24px)",
		margin: "md (16px) horizontal",
	},

	questionCard: {
		structure: "Title + grid of answer options + action button",
		title: {
			fontSize: 24,
			fontWeight: "bold",
			color: "black",
			marginBottom: 24,
		},
		optionsGrid: {
			layout: "2x2 grid",
			gap: 12,
			marginBottom: 24,
		},
	},

	optionCard: {
		structure: "Icon + description text in white rounded container",
		backgroundColor: "white",
		borderRadius: "medium (16px)",
		padding: "md (16px)",
		minHeight: 80,
		layout: "Vertical stack with icon at top, text below",
		icon: {
			size: 32,
			marginBottom: 8,
			colors: ["yellow", "orange", "blue", "green"],
		},
		text: {
			fontSize: 14,
			fontWeight: "regular",
			color: "black",
			lineHeight: 1.4,
		},
	},

	actionButton: {
		structure: "Full-width rounded button with centered text",
		backgroundColor: "Semi-transparent white (rgba(255,255,255,0.3))",
		borderRadius: "full",
		padding: "md (16px) vertical",
		text: {
			fontSize: 16,
			fontWeight: "semibold",
			color: "black",
		},
		states: {
			default: "Semi-transparent white background",
			hover: "Slightly more opaque",
			pressed: "Reduced opacity",
		},
	},

	informationCard: {
		structure: "Illustration + title + subtitle + CTA button",
		illustration: {
			style: "Flat, geometric, colorful vector graphics",
			position: "Top center",
			colors: ["yellow", "green", "white", "black"],
			style_notes: "Simple shapes, bold colors, minimal details",
		},
		content: {
			title: {
				fontSize: 24,
				fontWeight: "bold",
				marginBottom: 8,
			},
			subtitle: {
				fontSize: 16,
				fontWeight: "regular",
				lineHeight: 1.4,
				marginBottom: 32,
			},
		},
	},

	navigationTabs: {
		structure: "Bottom fixed navigation with 3 tabs",
		backgroundColor: "#1A1A1A",
		items: [
			{
				label: "Settings",
				icon: "gear/cog",
				position: "left",
			},
			{
				label: "Cards",
				icon: "rectangle/card",
				position: "center",
				active: true,
			},
			{
				label: "Dashboard",
				icon: "grid/squares",
				position: "right",
			},
		],
		activeState: {
			iconColor: "#9AFF9A",
			textColor: "#9AFF9A",
		},
		inactiveState: {
			iconColor: "#666666",
			textColor: "#666666",
		},
	},

	moreButton: {
		structure: "Three dots in circle, positioned top-right",
		backgroundColor: "Semi-transparent white",
		size: 32,
		borderRadius: "full",
		position: "absolute top-right with 16px margin",
	},
};

// Illustration style guide
export const illustrationStyle = {
	style: "Flat vector graphics with geometric shapes",
	characteristics: [
		"Bold, saturated colors",
		"Simple geometric forms",
		"Minimal detail and complexity",
		"High contrast color combinations",
		"Abstract representations rather than realistic depictions",
	],
	commonElements: [
		"Circles and rounded rectangles",
		"Simplified human figures",
		"Basic geometric shapes (triangles, squares)",
		"Magnifying glasses, briefcases, megaphones as icons",
		"Layered composition with overlapping elements",
	],
	colorUsage: [
		"Yellow for highlights and important elements",
		"Green for positive/success states",
		"Black for contrast and definition",
		"White for backgrounds and negative space",
	],
};

// Design principles
export const designPrinciples = {
	visualHierarchy: "Use vibrant background colors to create primary focus areas, white cards for secondary content",
	contrast: "High contrast between background and foreground elements for accessibility",
	consistency: "Consistent spacing, border radius, and color usage across all components",
	simplicity: "Clean, minimal interface with clear visual separation",
	accessibility: "Strong color contrast, readable font sizes, clear interactive elements",
};

// Interaction patterns
export const interactionPatterns = {
	cardSelection: "Visual feedback on tap with slight opacity change",
	buttonStates: "Hover and pressed states with opacity variations",
	navigation: "Bottom tab navigation with active state highlighting",
	scrolling: "Vertical scroll with card-based layout",
};

// Responsive guidelines
export const responsiveGuidelines = {
	mobile: "Design optimized for single-hand use with thumb-friendly interaction zones",
	spacing: "Maintain consistent margins and padding across different screen sizes",
	typography: "Ensure minimum touch target size of 44px for interactive elements",
};

// Utility function for contrast color
export const getContrastColor = () => ({
	primary: brandColors.primary.vibrantGreen,
	secondary: brandColors.primary.neonGreen,
	text: brandColors.neutrals.textPrimary,
	textMuted: brandColors.neutrals.textSecondary,
	background: brandColors.neutrals.darkBackground,
	surface: brandColors.neutrals.cardBackground,
	border: brandColors.neutrals.textSecondary,
});
