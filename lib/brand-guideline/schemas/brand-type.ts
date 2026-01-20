import { z } from "zod";
import { LogoAssetSchema } from "./intermediate";

const LogoVariantSchema = z.object({
	light: LogoAssetSchema,
	dark: LogoAssetSchema,
});

const LogoWithContrastSchema = z.object({
	grayscale: z.number(),
	logo: LogoAssetSchema,
	contrastRatio: z.number(),
});

const TypeScaleSchema = z.object({
	fontFamily: z.string(),
	fontSize: z.number(),
	lineHeight: z.number(),
	fontWeight: z.number(),
	letterSpacing: z.number().optional(),
	textTransform: z.string().optional(),
});

const FontSpecSchema = z.object({
	name: z.string(),
	fallback: z.array(z.string()),
	weights: z.array(z.number()),
	source: z.string().optional(),
});

export const BrandTypeSchema = z.object({
	meta: z.object({
		brandName: z.string(),
		version: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	}),
	logo: z.object({
		verticalLogo: LogoVariantSchema,
		horizontalLogo: LogoVariantSchema,
		symbols: z.object({
			mainSymbol: LogoVariantSchema,
			textLogo: LogoVariantSchema,
			specialLogo: LogoVariantSchema,
			textLogoOnBackground: z.object({
				withLightLogo: z.array(LogoWithContrastSchema),
				withDarkLogo: z.array(LogoWithContrastSchema),
			}),
		}),
		spacingAndSize: z.object({
			clearSpace: z.object({
				unit: z.string(),
				value: z.number(),
				description: z.string(),
			}),
			minimumSize: z.object({
				print: z.object({ height: z.number(), unit: z.string() }),
				digital: z.object({ height: z.number(), unit: z.string() }),
			}),
			recommendedSizes: z.array(
				z.object({
					name: z.string(),
					width: z.number(),
					height: z.number(),
					useCase: z.string(),
				}),
			),
		}),
	}),
	color: z.object({
		brand: z.object({
			primary: z.object({
				name: z.string(),
				hex: z.string(),
				rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional(),
				hsl: z.object({ h: z.number(), s: z.number(), l: z.number() }).optional(),
				scale: z.record(z.string()),
			}),
			secondary: z.object({
				name: z.string(),
				hex: z.string(),
				rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional(),
				scale: z.record(z.string()),
			}),
			accent: z.object({
				name: z.string(),
				hex: z.string(),
				rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional(),
			}),
		}),
		lightTheme: z.object({
			background: z.record(z.string()),
			foreground: z.record(z.string()),
			border: z.record(z.string()),
			status: z.record(z.string()),
		}),
		darkTheme: z.object({
			background: z.record(z.string()),
			foreground: z.record(z.string()),
			border: z.record(z.string()),
			status: z.record(z.string()),
		}),
	}),
	typography: z.object({
		titleFont: FontSpecSchema.optional(),
		bodyFont: FontSpecSchema.optional(),
		monoFont: FontSpecSchema.optional(),
		scale: z.object({
			display: z.record(TypeScaleSchema),
			heading: z.record(TypeScaleSchema),
			body: z.record(TypeScaleSchema),
			label: z.record(TypeScaleSchema),
			caption: TypeScaleSchema,
			overline: TypeScaleSchema,
		}),
		application: z.array(
			z.object({
				medium: z.string(),
				name: z.string(),
				description: z.string(),
				styles: z.record(z.string()),
				adjustments: z.record(z.number()).optional(),
			}),
		),
	}),
	brandOverview: z
		.object({
			mission: z.string().optional(),
			vision: z.string().optional(),
			values: z.array(z.string()).optional(),
			personality: z
				.object({
					traits: z.array(
						z.object({
							name: z.string(),
							description: z.string(),
						}),
					),
					archetype: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
	toneOfVoice: z
		.object({
			traits: z
				.array(
					z.object({
						name: z.string(),
						spectrum: z.tuple([z.string(), z.string()]),
						value: z.number(),
						description: z.string().optional(),
					}),
				)
				.optional(),
			examples: z
				.array(
					z.object({
						scenario: z.string(),
						good: z.string(),
						bad: z.string().optional(),
					}),
				)
				.optional(),
			guidelines: z.array(z.string()).optional(),
		})
		.optional(),
	visualElements: z
		.object({
			icons: z
				.object({
					style: z.string(),
					library: z.string().optional(),
					guidelines: z.array(z.string()),
				})
				.optional(),
			patterns: z
				.object({
					usage: z.string(),
					examples: z.array(z.string()).optional(),
				})
				.optional(),
			illustrations: z
				.object({
					style: z.string(),
					examples: z.array(z.string()).optional(),
				})
				.optional(),
		})
		.optional(),
});

export type BrandType = z.infer<typeof BrandTypeSchema>;
