import type { BrandType } from "./types";

export const mockCocaColaBrandType: BrandType = {
	meta: {
		brandName: "Coca-Cola Zero",
		version: "1.0",
		createdAt: "2009-12-01T00:00:00Z",
		updatedAt: "2009-12-01T00:00:00Z",
	},
	logo: {
		verticalLogo: {
			light: {
				url: "/assets/coca-cola/vertical-light.svg",
				format: "svg",
				width: 220,
				height: 320,
			},
			dark: {
				url: "/assets/coca-cola/vertical-dark.svg",
				format: "svg",
				width: 220,
				height: 320,
			},
		},
		horizontalLogo: {
			light: {
				url: "/assets/coca-cola/horizontal-light.svg",
				format: "svg",
				width: 420,
				height: 120,
			},
			dark: {
				url: "/assets/coca-cola/horizontal-dark.svg",
				format: "svg",
				width: 420,
				height: 120,
			},
		},
		symbols: {
			mainSymbol: {
				light: {
					url: "/assets/coca-cola/contour-symbol-light.svg",
					format: "svg",
					width: 120,
					height: 240,
				},
				dark: {
					url: "/assets/coca-cola/contour-symbol-dark.svg",
					format: "svg",
					width: 120,
					height: 240,
				},
			},
			textLogo: {
				light: {
					url: "/assets/coca-cola/text-light.svg",
					format: "svg",
					width: 320,
					height: 80,
				},
				dark: {
					url: "/assets/coca-cola/text-dark.svg",
					format: "svg",
					width: 320,
					height: 80,
				},
			},
			specialLogo: {
				light: {
					url: "/assets/coca-cola/ribbon-light.svg",
					format: "svg",
					width: 240,
					height: 140,
				},
				dark: {
					url: "/assets/coca-cola/ribbon-dark.svg",
					format: "svg",
					width: 240,
					height: 140,
				},
			},
			textLogoOnBackground: {
				withLightLogo: [
					{
						grayscale: 60,
						logo: {
							url: "/assets/coca-cola/text-light.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 4.5,
					},
					{
						grayscale: 80,
						logo: {
							url: "/assets/coca-cola/text-light.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 8.1,
					},
					{
						grayscale: 100,
						logo: {
							url: "/assets/coca-cola/text-light.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 21.0,
					},
				],
				withDarkLogo: [
					{
						grayscale: 10,
						logo: {
							url: "/assets/coca-cola/text-dark.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 18.5,
					},
					{
						grayscale: 30,
						logo: {
							url: "/assets/coca-cola/text-dark.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 10.8,
					},
					{
						grayscale: 50,
						logo: {
							url: "/assets/coca-cola/text-dark.svg",
							format: "svg",
							width: 320,
							height: 80,
						},
						contrastRatio: 5.3,
					},
				],
			},
		},
		spacingAndSize: {
			clearSpace: {
				unit: "h",
				value: 1,
				description:
					"Clear space equals the height of the hyphen between Coca and Cola.",
			},
			minimumSize: {
				print: {
					height: 15.875,
					unit: "mm",
				},
				digital: {
					height: 100,
					unit: "px",
				},
			},
			recommendedSizes: [
				{
					name: "Shelf Strip",
					width: 800,
					height: 120,
					useCase: "Retail shelf strip or narrow POS banner",
				},
				{
					name: "Poster",
					width: 1080,
					height: 1350,
					useCase: "Event or in-store promotional poster",
				},
				{
					name: "Digital Banner",
					width: 1200,
					height: 628,
					useCase: "Web hero or social ad placement",
				},
			],
		},
	},
	color: {
		brand: {
			primary: {
				name: "Coke Black",
				hex: "#000000",
				rgb: {
					r: 0,
					g: 0,
					b: 0,
				},
				hsl: {
					h: 0,
					s: 0,
					l: 0,
				},
				scale: {
					"50": "#F7F7F7",
					"100": "#EDEDED",
					"200": "#D1D1D1",
					"300": "#B0B0B0",
					"400": "#8C8C8C",
					"500": "#000000",
					"600": "#0A0A0A",
					"700": "#050505",
					"800": "#030303",
					"900": "#000000",
					"950": "#000000",
				},
			},
			secondary: {
				name: "Coke Red",
				hex: "#F40000",
				rgb: {
					r: 244,
					g: 0,
					b: 0,
				},
				scale: {
					"50": "#FFF1F1",
					"100": "#FFD7D7",
					"200": "#FFB3B3",
					"300": "#FF8A8A",
					"400": "#FF4D4D",
					"500": "#F40000",
					"600": "#D90000",
					"700": "#B40000",
					"800": "#8F0000",
					"900": "#6B0000",
					"950": "#4A0000",
				},
			},
			accent: {
				name: "Coke Silver",
				hex: "#C0C0C0",
				rgb: {
					r: 192,
					g: 192,
					b: 192,
				},
			},
		},
		lightTheme: {
			background: {
				primary: "#FFFFFF",
				secondary: "#F2F2F2",
				tertiary: "#E5E5E5",
			},
			foreground: {
				primary: "#0A0A0A",
				secondary: "#333333",
				muted: "#6B6B6B",
			},
			border: {
				default: "#E0E0E0",
				muted: "#F0F0F0",
			},
			status: {
				success: "#16A34A",
				warning: "#F59E0B",
				error: "#DC2626",
				info: "#2563EB",
			},
		},
		darkTheme: {
			background: {
				primary: "#0A0A0A",
				secondary: "#121212",
				tertiary: "#1B1B1B",
			},
			foreground: {
				primary: "#F5F5F5",
				secondary: "#D4D4D4",
				muted: "#A3A3A3",
			},
			border: {
				default: "#2A2A2A",
				muted: "#1F1F1F",
			},
			status: {
				success: "#22C55E",
				warning: "#FBBF24",
				error: "#EF4444",
				info: "#60A5FA",
			},
		},
	},
	typography: {
		titleFont: {
			name: "Gotham",
			fallback: ["Arial", "Helvetica", "sans-serif"],
			weights: [700],
			source: "commercial",
		},
		bodyFont: {
			name: "Gotham",
			fallback: ["Arial", "Helvetica", "sans-serif"],
			weights: [400, 500],
			source: "commercial",
		},
		monoFont: {
			name: "Courier New",
			fallback: ["monospace"],
			weights: [400],
		},
		scale: {
			display: {
				large: {
					fontFamily: "Gotham",
					fontSize: 72,
					lineHeight: 1.05,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				medium: {
					fontFamily: "Gotham",
					fontSize: 56,
					lineHeight: 1.08,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				small: {
					fontFamily: "Gotham",
					fontSize: 44,
					lineHeight: 1.1,
					letterSpacing: -0.01,
					fontWeight: 700,
				},
			},
			heading: {
				h1: {
					fontFamily: "Gotham",
					fontSize: 36,
					lineHeight: 1.2,
					letterSpacing: -0.01,
					fontWeight: 700,
				},
				h2: {
					fontFamily: "Gotham",
					fontSize: 30,
					lineHeight: 1.25,
					letterSpacing: -0.01,
					fontWeight: 700,
				},
				h3: {
					fontFamily: "Gotham",
					fontSize: 24,
					lineHeight: 1.3,
					fontWeight: 600,
				},
				h4: {
					fontFamily: "Gotham",
					fontSize: 20,
					lineHeight: 1.35,
					fontWeight: 600,
				},
				h5: {
					fontFamily: "Gotham",
					fontSize: 18,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				h6: {
					fontFamily: "Gotham",
					fontSize: 16,
					lineHeight: 1.4,
					fontWeight: 500,
				},
			},
			body: {
				large: {
					fontFamily: "Gotham",
					fontSize: 18,
					lineHeight: 1.5,
					fontWeight: 400,
				},
				medium: {
					fontFamily: "Gotham",
					fontSize: 16,
					lineHeight: 1.5,
					fontWeight: 400,
				},
				small: {
					fontFamily: "Gotham",
					fontSize: 14,
					lineHeight: 1.5,
					fontWeight: 400,
				},
			},
			label: {
				large: {
					fontFamily: "Gotham",
					fontSize: 14,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				medium: {
					fontFamily: "Gotham",
					fontSize: 12,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				small: {
					fontFamily: "Gotham",
					fontSize: 11,
					lineHeight: 1.4,
					fontWeight: 500,
					textTransform: "uppercase",
				},
			},
			caption: {
				fontFamily: "Gotham",
				fontSize: 12,
				lineHeight: 1.4,
				fontWeight: 400,
			},
			overline: {
				fontFamily: "Gotham",
				fontSize: 10,
				lineHeight: 1.5,
				letterSpacing: 0.08,
				fontWeight: 600,
				textTransform: "uppercase",
			},
		},
		application: [
			{
				medium: "packaging",
				name: "Packaging",
				description: "Primary pack and label executions",
				styles: {
					title: "h1",
					subtitle: "h3",
					body: "medium",
					caption: "caption",
				},
			},
			{
				medium: "pos",
				name: "Point of Sale",
				description: "Retail and in-store promotion",
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
				medium: "outdoor",
				name: "Outdoor",
				description: "Large format and signage",
				styles: {
					title: "large",
					subtitle: "h1",
					body: "large",
				},
				adjustments: {
					baseSize: 4,
				},
			},
			{
				medium: "digital",
				name: "Digital",
				description: "Web, social, and motion placements",
				styles: {
					title: "h2",
					subtitle: "h4",
					body: "medium",
				},
			},
		],
	},
	brandOverview: {
		mission:
			"Deliver great Coke taste with zero sugar and a bold, youthful image.",
		vision: "Coca-Cola Zero is a beacon of possibilities.",
		values: [
			"Bold simplicity",
			"Real and genuine",
			"Own black",
			"Bold and unexpected",
		],
		personality: {
			traits: [
				{
					name: "Maverick",
					description: "Unconventional and confident in its stance.",
				},
				{
					name: "Bold",
					description: "Direct, strong, and unafraid of contrast.",
				},
				{
					name: "Smart",
					description: "Clever and self-aware with a clear point of view.",
				},
				{
					name: "Humorous",
					description: "Dry, confident humor to keep the tone fresh.",
				},
				{
					name: "Purposeful",
					description: "Driven by a clear purpose and decisive action.",
				},
			],
			archetype: "Explorer",
		},
	},
	toneOfVoice: {
		traits: [
			{
				name: "Boldness",
				spectrum: ["Reserved", "Bold"],
				value: 85,
				description: "Confident, high-contrast, and decisive.",
			},
			{
				name: "Authenticity",
				spectrum: ["Polished", "Genuine"],
				value: 80,
				description: "Direct and grounded, never overproduced.",
			},
			{
				name: "Unexpectedness",
				spectrum: ["Predictable", "Surprising"],
				value: 70,
				description: "A sharp edge that keeps things fresh.",
			},
			{
				name: "Humor",
				spectrum: ["Serious", "Witty"],
				value: 55,
				description: "Dry, confident wit without losing clarity.",
			},
		],
		examples: [
			{
				scenario: "Product intro",
				good: "All the taste. Zero sugar. Blacked out with confidence.",
				bad: "Coca-Cola Zero delivers a refreshing beverage experience.",
			},
			{
				scenario: "Call to action",
				good: "Own the black. Grab a Zero.",
				bad: "Please consider purchasing Coca-Cola Zero today.",
			},
		],
		guidelines: [
			"Keep headlines short, bold, and direct.",
			"Let black dominate; use red as a sharp frame.",
			"Be confident and genuine, never overly formal.",
			"Inject wit when it helps, but keep clarity first.",
		],
	},
	visualElements: {
		icons: {
			style: "Solid, high-contrast, minimal detail",
			guidelines: [
				"Use black as the base fill with red accents sparingly.",
				"Maintain strong silhouettes and avoid thin strokes.",
			],
		},
		patterns: {
			usage:
				"Dynamic Ribbon and Contour Bottle silhouettes as primary motifs, anchored by black fields.",
			examples: ["Ribbon sweeps", "Contour bottle outlines"],
		},
		illustrations: {
			style: "Bold vector shapes with sharp contrast",
			examples: ["Monochrome silhouettes", "Crisp red highlights"],
		},
	},
};
