/**
 * Design Tokens - Consistent spacing and typography system
 */

export const spacing = {
	// Section spacing (between major sections)
	sectionGap: "0.75rem", // gap-3 = 12px
	sectionPadding: "1.5rem", // py-6 = 24px

	// Card spacing
	cardGap: "0.75rem", // gap-3 = 12px
	cardPadding: "1.25rem", // p-5 = 20px

	// Element spacing (within cards)
	elementGap: "0.75rem", // gap-3 = 12px
	elementPadding: "1rem", // p-4 = 16px

	// Micro spacing
	microGap: "0.5rem", // gap-2 = 8px
	microPadding: "0.5rem", // p-2 = 8px
} as const;

export const typography = {
	// Display (Hero sections only)
	display: {
		fontSize: "text-5xl",
		fontWeight: "font-bold",
		tracking: "tracking-tight",
		lineHeight: "leading-tight",
	},

	// Section titles
	sectionTitle: {
		fontSize: "text-3xl",
		fontWeight: "font-semibold",
		tracking: "tracking-tight",
		lineHeight: "leading-snug",
	},

	// Subsection titles
	subsection: {
		fontSize: "text-xl",
		fontWeight: "font-medium",
		tracking: "tracking-normal",
		lineHeight: "leading-normal",
	},

	// Body text
	body: {
		fontSize: "text-base",
		fontWeight: "font-normal",
		tracking: "tracking-normal",
		lineHeight: "leading-relaxed",
	},

	// Small text
	small: {
		fontSize: "text-sm",
		fontWeight: "font-normal",
		tracking: "tracking-normal",
		lineHeight: "leading-normal",
	},

	// Label/Caption
	label: {
		fontSize: "text-xs",
		fontWeight: "font-normal",
		tracking: "tracking-[0.2em]",
		lineHeight: "leading-normal",
		textTransform: "uppercase" as const,
	},

	// Muted label
	mutedLabel: {
		fontSize: "text-xs",
		fontWeight: "font-normal",
		tracking: "tracking-[0.3em]",
		lineHeight: "leading-normal",
		textTransform: "uppercase" as const,
	},
} as const;

export const transitions = {
	fast: "duration-150",
	normal: "duration-200",
	slow: "duration-300",
} as const;

export const shadows = {
	card: "shadow-[0_30px_120px_rgba(15,23,42,0.12)]",
	elevated: "shadow-[0_20px_60px_rgba(15,23,42,0.18)]",
	subtle: "shadow-sm",
} as const;

/**
 * Helper to build className from typography tokens
 */
export function buildTypographyClass(
	style: keyof typeof typography,
): string {
	const tokens = typography[style];
	return Object.values(tokens).join(" ");
}

/**
 * Get spacing value
 */
export function getSpacing(key: keyof typeof spacing): string {
	return spacing[key];
}
