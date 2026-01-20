export type LogoAsset = {
	url: string;
	format: string;
	width: number;
	height: number;
};

export type TypeScale = {
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
	fontWeight: number;
	letterSpacing?: number;
	textTransform?: string;
};

export type BrandType = {
	meta: {
		brandName: string;
		version: string;
		createdAt: string;
		updatedAt: string;
	};
	logo: {
		verticalLogo: { light: LogoAsset; dark: LogoAsset };
		horizontalLogo: { light: LogoAsset; dark: LogoAsset };
		symbols: {
			mainSymbol: { light: LogoAsset; dark: LogoAsset };
			textLogo: { light: LogoAsset; dark: LogoAsset };
			specialLogo: { light: LogoAsset; dark: LogoAsset };
			textLogoOnBackground: {
				withLightLogo: Array<{
					grayscale: number;
					logo: LogoAsset;
					contrastRatio: number;
				}>;
				withDarkLogo: Array<{
					grayscale: number;
					logo: LogoAsset;
					contrastRatio: number;
				}>;
			};
		};
		spacingAndSize: {
			clearSpace: { unit: string; value: number; description: string };
			minimumSize: {
				print: { height: number; unit: string };
				digital: { height: number; unit: string };
			};
			recommendedSizes: Array<{
				name: string;
				width: number;
				height: number;
				useCase: string;
			}>;
		};
	};
	color: {
		brand: {
			primary: {
				name: string;
				hex: string;
				rgb?: { r: number; g: number; b: number };
				hsl?: { h: number; s: number; l: number };
				scale: Record<string, string>;
			};
			secondary: {
				name: string;
				hex: string;
				rgb?: { r: number; g: number; b: number };
				scale: Record<string, string>;
			};
			accent: {
				name: string;
				hex: string;
				rgb?: { r: number; g: number; b: number };
			};
		};
		lightTheme: {
			background: Record<string, string>;
			foreground: Record<string, string>;
			border: Record<string, string>;
			status: Record<string, string>;
		};
		darkTheme: {
			background: Record<string, string>;
			foreground: Record<string, string>;
			border: Record<string, string>;
			status: Record<string, string>;
		};
	};
	typography: {
		titleFont?: {
			name: string;
			fallback: string[];
			weights: number[];
			source?: string;
		};
		bodyFont?: {
			name: string;
			fallback: string[];
			weights: number[];
			source?: string;
		};
		monoFont?: {
			name: string;
			fallback: string[];
			weights: number[];
			source?: string;
		};
		scale: {
			display: Record<string, TypeScale>;
			heading: Record<string, TypeScale>;
			body: Record<string, TypeScale>;
			label: Record<string, TypeScale>;
			caption: TypeScale;
			overline: TypeScale;
		};
		application: Array<{
			medium: string;
			name: string;
			description: string;
			styles: Record<string, string>;
			adjustments?: Record<string, number>;
		}>;
	};
	// NEW: Extended sections for comprehensive brand guide
	brandOverview?: {
		mission?: string;
		vision?: string;
		values?: string[];
		personality?: {
			traits: Array<{ name: string; description: string }>;
			archetype?: string;
		};
	};
	toneOfVoice?: {
		traits?: Array<{
			name: string;
			spectrum: [string, string]; // e.g., ["Formal", "Casual"]
			value: number; // 0-100
			description?: string;
		}>;
		examples?: Array<{
			scenario: string;
			good: string;
			bad?: string;
		}>;
		guidelines?: string[];
	};
	visualElements?: {
		icons?: {
			style: string;
			library?: string;
			guidelines: string[];
		};
		patterns?: {
			usage: string;
			examples?: string[];
		};
		illustrations?: {
			style: string;
			examples?: string[];
		};
	};
};

export type ThemeColors = {
	light: {
		background: Record<string, string>;
		foreground: Record<string, string>;
		border: Record<string, string>;
	};
	dark: {
		background: Record<string, string>;
		foreground: Record<string, string>;
		border: Record<string, string>;
	};
	brand: {
		primary: string;
		secondary: string;
		accent: string;
	};
};
