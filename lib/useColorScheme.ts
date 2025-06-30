// Fixed single theme for the app
export function useColorScheme() {
	return {
		colorScheme: "light" as const,
		isDarkColorScheme: false,
		setColorScheme: () => {}, // No-op since we only have one theme
		toggleColorScheme: () => {}, // No-op since we only have one theme
	};
}
