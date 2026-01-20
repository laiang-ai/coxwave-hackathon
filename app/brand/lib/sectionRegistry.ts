import type { ComponentType, ReactNode } from "react";

/**
 * Configuration for a brand guide section
 */
export interface SectionConfig {
	/** Unique identifier */
	id: string;
	/** Display title */
	title: string;
	/** Description of what this section contains */
	description: string;
	/** JSON path in BrandType (e.g., "color.brand") */
	jsonPath: string;
	/** React component to render this section */
	component: ComponentType<SectionProps>;
	/** Display order (lower = earlier) */
	order: number;
	/** Whether visible by default */
	defaultVisible: boolean;
	/** Optional icon */
	icon?: ReactNode;
}

/**
 * Props passed to section components
 */
export interface SectionProps {
	/** Section data extracted from brand JSON */
	data: any;
	/** JSON path to this section */
	path: string;
}

/**
 * Section registry - maps section IDs to configurations
 * Import actual components dynamically to avoid circular dependencies
 */
export const sectionRegistry: SectionConfig[] = [
	{
		id: "hero",
		title: "Brand Cover",
		description: "Hero section with brand name",
		jsonPath: "meta",
		component: () => null, // Rendered separately in BrandGuideClient
		order: 0,
		defaultVisible: true,
	},
	{
		id: "logo-system",
		title: "Logo System",
		description: "Primary logo variants and usage guidelines",
		jsonPath: "logo",
		component: () => null, // LogoSection already exists
		order: 1,
		defaultVisible: true,
	},
	{
		id: "spacing-size",
		title: "Spacing & Size",
		description: "Clear space and minimum size requirements",
		jsonPath: "logo.spacingAndSize",
		component: () => null, // Already rendered in BrandGuideClient
		order: 2,
		defaultVisible: true,
	},
	{
		id: "color-palette",
		title: "Color Palette",
		description: "Primary, secondary, and accent colors",
		jsonPath: "color.brand",
		component: () => null, // Already rendered in BrandGuideClient
		order: 3,
		defaultVisible: true,
	},
	{
		id: "typography",
		title: "Typography",
		description: "Font families and type scale",
		jsonPath: "typography",
		component: () => null, // Already rendered in BrandGuideClient
		order: 4,
		defaultVisible: true,
	},
	{
		id: "template-map",
		title: "Template Map",
		description: "Web structure and routes",
		jsonPath: "meta", // No specific path, uses metadata
		component: () => null, // Already rendered in BrandGuideClient
		order: 5,
		defaultVisible: true,
	},
];

/**
 * Get section configuration by ID
 */
export function getSectionById(id: string): SectionConfig | undefined {
	return sectionRegistry.find((s) => s.id === id);
}

/**
 * Get section configuration by JSON path
 */
export function getSectionByPath(path: string): SectionConfig | undefined {
	return sectionRegistry.find((s) => s.jsonPath === path);
}

/**
 * Get visible sections based on customization
 */
export function getVisibleSections(customization: {
	sectionOrder: string[];
	hiddenSections: string[];
}): SectionConfig[] {
	const { sectionOrder, hiddenSections } = customization;

	// Filter out hidden sections
	const visible = sectionRegistry.filter(
		(s) => !hiddenSections.includes(s.id),
	);

	// Sort by custom order if provided, otherwise by default order
	return visible.sort((a, b) => {
		const aIndex = sectionOrder.indexOf(a.id);
		const bIndex = sectionOrder.indexOf(b.id);

		// If both in custom order, use that
		if (aIndex !== -1 && bIndex !== -1) {
			return aIndex - bIndex;
		}

		// If only one in custom order, prioritize it
		if (aIndex !== -1) return -1;
		if (bIndex !== -1) return 1;

		// Otherwise use default order
		return a.order - b.order;
	});
}

/**
 * Get default section order
 */
export function getDefaultSectionOrder(): string[] {
	return sectionRegistry
		.filter((s) => s.defaultVisible)
		.sort((a, b) => a.order - b.order)
		.map((s) => s.id);
}
