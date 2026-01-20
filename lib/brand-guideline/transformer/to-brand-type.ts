import type {
	LogoAsset as BrandLogoAsset,
	BrandType,
	TypeScale,
} from "@/app/brand/types";
import type {
	ColorSpec,
	GuidelineModel,
	IdentityModel,
	LogoAsset,
} from "../schemas";

// ============================================
// Color Utilities
// ============================================
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: { r: 0, g: 0, b: 0 };
}

function rgbToHsl(
	r: number,
	g: number,
	b: number,
): { h: number; s: number; l: number } {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

function generateColorScale(baseHex: string): Record<string, string> {
	const rgb = hexToRgb(baseHex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

	// Generate a 50-950 scale based on the base color
	const lightnesses = {
		"50": 97,
		"100": 94,
		"200": 86,
		"300": 77,
		"400": 66,
		"500": hsl.l, // Base color
		"600": hsl.l - 8,
		"700": hsl.l - 16,
		"800": hsl.l - 24,
		"900": hsl.l - 32,
		"950": hsl.l - 40,
	};

	const scale: Record<string, string> = {};
	for (const [key, lightness] of Object.entries(lightnesses)) {
		scale[key] = hslToHex(hsl.h, hsl.s, Math.max(5, Math.min(95, lightness)));
	}

	return scale;
}

function hslToHex(h: number, s: number, l: number): string {
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0;
	let g = 0;
	let b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	const toHex = (n: number) =>
		Math.round((n + m) * 255)
			.toString(16)
			.padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ============================================
// Logo Transform
// ============================================
function createDefaultLogoAsset(logoAsset: LogoAsset): BrandLogoAsset {
	return {
		url: logoAsset.url,
		format: logoAsset.format,
		width: logoAsset.width,
		height: logoAsset.height,
	};
}

function transformLogo(
	guideline: GuidelineModel,
	logoAsset: LogoAsset,
): BrandType["logo"] {
	const defaultAsset = createDefaultLogoAsset(logoAsset);

	// Parse minimum sizes from guideline
	const printSize = parseInt(guideline.logo.minimumSize.print) || 10;
	const digitalSize = parseInt(guideline.logo.minimumSize.digital) || 32;

	// Parse clear space ratio
	const clearSpaceValue = parseFloat(guideline.logo.clearSpace.ratio) || 1;

	return {
		verticalLogo: {
			light: { ...defaultAsset, width: 200, height: 280 },
			dark: { ...defaultAsset, width: 200, height: 280 },
		},
		horizontalLogo: {
			light: { ...defaultAsset, width: 400, height: 100 },
			dark: { ...defaultAsset, width: 400, height: 100 },
		},
		symbols: {
			mainSymbol: {
				light: { ...defaultAsset, width: 100, height: 100 },
				dark: { ...defaultAsset, width: 100, height: 100 },
			},
			textLogo: {
				light: { ...defaultAsset, width: 300, height: 60 },
				dark: { ...defaultAsset, width: 300, height: 60 },
			},
			specialLogo: {
				light: { ...defaultAsset, width: 200, height: 200 },
				dark: { ...defaultAsset, width: 200, height: 200 },
			},
			textLogoOnBackground: {
				withLightLogo: [60, 70, 80, 90, 100].map((grayscale) => ({
					grayscale,
					logo: { ...defaultAsset, width: 300, height: 60 },
					contrastRatio: 4.5 + (grayscale - 60) * 0.15,
				})),
				withDarkLogo: [10, 20, 30, 40, 50].map((grayscale) => ({
					grayscale,
					logo: { ...defaultAsset, width: 300, height: 60 },
					contrastRatio: 21 - grayscale * 0.35,
				})),
			},
		},
		spacingAndSize: {
			clearSpace: {
				unit: "x",
				value: clearSpaceValue,
				description: guideline.logo.clearSpace.description,
			},
			minimumSize: {
				print: { height: printSize, unit: "mm" },
				digital: { height: digitalSize, unit: "px" },
			},
			recommendedSizes: [
				{
					name: "Favicon",
					width: 32,
					height: 32,
					useCase: "브라우저 탭 아이콘",
				},
				{
					name: "App Icon",
					width: 512,
					height: 512,
					useCase: "앱 스토어 아이콘",
				},
				{
					name: "Social Media",
					width: 400,
					height: 400,
					useCase: "소셜 미디어 프로필",
				},
			],
		},
	};
}

// ============================================
// Color Transform
// ============================================
function transformColor(guideline: GuidelineModel): BrandType["color"] {
	const primary = guideline.color.primary[0];
	const secondary = guideline.color.secondary[0] || guideline.color.neutral[0];
	const accent =
		guideline.color.accent?.[0] || guideline.color.primary[1] || primary;

	const primaryRgb = primary?.rgb || hexToRgb(primary?.hex || "#2563EB");
	const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

	const secondaryRgb = secondary?.rgb || hexToRgb(secondary?.hex || "#64748B");
	const accentRgb = accent?.rgb || hexToRgb(accent?.hex || "#F97316");

	return {
		brand: {
			primary: {
				name: primary?.name || "Primary",
				hex: primary?.hex || "#2563EB",
				rgb: primaryRgb,
				hsl: primaryHsl,
				scale: generateColorScale(primary?.hex || "#2563EB"),
			},
			secondary: {
				name: secondary?.name || "Secondary",
				hex: secondary?.hex || "#64748B",
				rgb: secondaryRgb,
				scale: generateColorScale(secondary?.hex || "#64748B"),
			},
			accent: {
				name: accent?.name || "Accent",
				hex: accent?.hex || "#F97316",
				rgb: accentRgb,
			},
		},
		lightTheme: generateLightTheme(guideline.color.neutral),
		darkTheme: generateDarkTheme(guideline.color.neutral),
	};
}

function generateLightTheme(
	neutralColors: ColorSpec[],
): BrandType["color"]["lightTheme"] {
	// Find lightest to darkest neutrals
	const sorted = [...neutralColors].sort((a, b) => {
		const aRgb = a.rgb || hexToRgb(a.hex);
		const bRgb = b.rgb || hexToRgb(b.hex);
		const aLightness = (aRgb.r + aRgb.g + aRgb.b) / 3;
		const bLightness = (bRgb.r + bRgb.g + bRgb.b) / 3;
		return bLightness - aLightness;
	});

	return {
		background: {
			primary: sorted[0]?.hex || "#FFFFFF",
			secondary: sorted[1]?.hex || "#F8FAFC",
			tertiary: sorted[2]?.hex || "#F1F5F9",
		},
		foreground: {
			primary: sorted[sorted.length - 1]?.hex || "#0F172A",
			secondary: sorted[sorted.length - 2]?.hex || "#475569",
			muted: sorted[Math.floor(sorted.length / 2)]?.hex || "#94A3B8",
		},
		border: {
			default: sorted[2]?.hex || "#E2E8F0",
			muted: sorted[1]?.hex || "#F1F5F9",
		},
		status: {
			success: "#22C55E",
			warning: "#F59E0B",
			error: "#EF4444",
			info: "#3B82F6",
		},
	};
}

function generateDarkTheme(
	neutralColors: ColorSpec[],
): BrandType["color"]["darkTheme"] {
	const sorted = [...neutralColors].sort((a, b) => {
		const aRgb = a.rgb || hexToRgb(a.hex);
		const bRgb = b.rgb || hexToRgb(b.hex);
		const aLightness = (aRgb.r + aRgb.g + aRgb.b) / 3;
		const bLightness = (bRgb.r + bRgb.g + bRgb.b) / 3;
		return aLightness - bLightness;
	});

	return {
		background: {
			primary: sorted[0]?.hex || "#0F172A",
			secondary: sorted[1]?.hex || "#1E293B",
			tertiary: sorted[2]?.hex || "#334155",
		},
		foreground: {
			primary: sorted[sorted.length - 1]?.hex || "#F8FAFC",
			secondary: sorted[sorted.length - 2]?.hex || "#CBD5E1",
			muted: sorted[Math.floor(sorted.length / 2)]?.hex || "#64748B",
		},
		border: {
			default: sorted[2]?.hex || "#334155",
			muted: sorted[1]?.hex || "#1E293B",
		},
		status: {
			success: "#4ADE80",
			warning: "#FBBF24",
			error: "#F87171",
			info: "#60A5FA",
		},
	};
}

// ============================================
// Typography Transform
// ============================================
function parseWeight(weight: string): number {
	const num = parseInt(weight);
	if (!isNaN(num)) return num;

	const weightMap: Record<string, number> = {
		thin: 100,
		extralight: 200,
		light: 300,
		regular: 400,
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		extrabold: 800,
		black: 900,
	};

	return weightMap[weight.toLowerCase()] || 400;
}

function parseSize(size: string): number {
	return parseInt(size) || 16;
}

function parseLineHeight(lineHeight: string): number {
	const num = parseFloat(lineHeight);
	return isNaN(num) ? 1.5 : num;
}

function parseLetterSpacing(letterSpacing?: string): number | undefined {
	if (!letterSpacing) return undefined;
	const num = parseFloat(letterSpacing);
	return isNaN(num) ? undefined : num;
}

function transformTypography(
	guideline: GuidelineModel,
): BrandType["typography"] {
	const primary = guideline.typography.primary;
	const weights = primary.weights.map(parseWeight);

	const toTypeScale = (spec: {
		size: string;
		weight: string;
		lineHeight: string;
		letterSpacing?: string;
		usage: string;
	}): TypeScale => ({
		fontFamily: primary.family,
		fontSize: parseSize(spec.size),
		lineHeight: parseLineHeight(spec.lineHeight),
		fontWeight: parseWeight(spec.weight),
		letterSpacing: parseLetterSpacing(spec.letterSpacing),
	});

	const hierarchy = guideline.typography.hierarchy;

	return {
		titleFont: {
			name: primary.family,
			fallback: primary.fallback,
			weights: weights.filter((w) => w >= 500),
			source: primary.source,
		},
		bodyFont: {
			name: primary.family,
			fallback: primary.fallback,
			weights: weights.filter((w) => w <= 600),
			source: primary.source,
		},
		monoFont: guideline.typography.secondary
			? {
					name: guideline.typography.secondary.family,
					fallback: ["monospace"],
					weights: [400, 500],
					source: "google",
				}
			: {
					name: "JetBrains Mono",
					fallback: ["monospace"],
					weights: [400, 500],
					source: "google",
				},
		scale: {
			display: {
				large: {
					fontFamily: primary.family,
					fontSize: 72,
					lineHeight: 1.1,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				medium: {
					fontFamily: primary.family,
					fontSize: 56,
					lineHeight: 1.1,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				small: {
					fontFamily: primary.family,
					fontSize: 44,
					lineHeight: 1.15,
					letterSpacing: -0.01,
					fontWeight: 600,
				},
			},
			heading: {
				h1: toTypeScale(hierarchy.h1),
				h2: toTypeScale(hierarchy.h2),
				h3: toTypeScale(hierarchy.h3),
				h4: {
					fontFamily: primary.family,
					fontSize: 20,
					lineHeight: 1.35,
					fontWeight: 600,
				},
				h5: {
					fontFamily: primary.family,
					fontSize: 18,
					lineHeight: 1.4,
					fontWeight: 600,
				},
				h6: {
					fontFamily: primary.family,
					fontSize: 16,
					lineHeight: 1.4,
					fontWeight: 600,
				},
			},
			body: {
				large: hierarchy.bodyLarge
					? toTypeScale(hierarchy.bodyLarge)
					: {
							fontFamily: primary.family,
							fontSize: 18,
							lineHeight: 1.6,
							fontWeight: 400,
						},
				medium: toTypeScale(hierarchy.body),
				small: hierarchy.small
					? toTypeScale(hierarchy.small)
					: {
							fontFamily: primary.family,
							fontSize: 14,
							lineHeight: 1.5,
							fontWeight: 400,
						},
			},
			label: {
				large: {
					fontFamily: primary.family,
					fontSize: 14,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				medium: {
					fontFamily: primary.family,
					fontSize: 12,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				small: {
					fontFamily: primary.family,
					fontSize: 11,
					lineHeight: 1.4,
					fontWeight: 500,
					textTransform: "uppercase",
				},
			},
			caption: toTypeScale(hierarchy.caption),
			overline: {
				fontFamily: primary.family,
				fontSize: 10,
				lineHeight: 1.5,
				letterSpacing: 0.1,
				fontWeight: 600,
				textTransform: "uppercase",
			},
		},
		application: [
			{
				medium: "website",
				name: "웹사이트",
				description: "데스크탑 및 태블릿 웹 브라우저용",
				styles: {
					title: "h1",
					subtitle: "h3",
					body: "medium",
					caption: "caption",
				},
			},
			{
				medium: "mobile",
				name: "모바일 앱",
				description: "iOS/Android 네이티브 앱용",
				styles: {
					title: "h2",
					subtitle: "h4",
					body: "small",
					caption: "caption",
				},
				adjustments: {
					baseSize: -2,
					lineHeightMultiplier: 1.1,
				},
			},
			{
				medium: "magazine",
				name: "매거진/인쇄물",
				description: "잡지, 브로셔, 카탈로그용",
				styles: {
					title: "large",
					subtitle: "h1",
					body: "large",
					caption: "caption",
				},
				adjustments: {
					lineHeightMultiplier: 1.2,
				},
			},
			{
				medium: "presentation",
				name: "프레젠테이션",
				description: "슬라이드 및 발표 자료용",
				styles: {
					title: "large",
					subtitle: "h2",
					body: "large",
				},
				adjustments: {
					baseSize: 4,
				},
			},
			{
				medium: "social",
				name: "소셜 미디어",
				description: "Instagram, Facebook, Twitter 등 SNS용",
				styles: {
					title: "h2",
					subtitle: "h4",
					body: "medium",
				},
			},
		],
	};
}

// ============================================
// Main Transform Function
// ============================================
export function toBrandType(
	identity: IdentityModel,
	guideline: GuidelineModel,
	logoAsset: LogoAsset,
): BrandType {
	const now = new Date().toISOString();

	return {
		meta: {
			brandName: identity.brand.name,
			version: "1.0.0",
			createdAt: now,
			updatedAt: now,
		},
		logo: transformLogo(guideline, logoAsset),
		color: transformColor(guideline),
		typography: transformTypography(guideline),
	};
}
