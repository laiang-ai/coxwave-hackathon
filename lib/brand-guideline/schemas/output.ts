import { z } from "zod";
import {
	BrandVisionSchema,
	GuidelineModelSchema,
	IdentityModelSchema,
	LogoAssetSchema,
	MarketContextSchema,
} from "./intermediate";

// ============================================
// CopywritingContent (Copywriting Agent 출력)
// ============================================
export const SloganSchema = z.object({
	text: z.string(),
	type: z.enum(["primary", "campaign", "product"]),
	context: z.string(),
	rationale: z.string(),
});

export const HeroCopySchema = z.object({
	headline: z.string(),
	subheadline: z.string(),
	bodyText: z.string().optional(),
	cta: z.string(),
	scenario: z.string(),
});

export const ChannelMessageSchema = z.object({
	channel: z.string(),
	tone: z.string(),
	examples: z.array(
		z.object({
			type: z.string(),
			text: z.string(),
		}),
	),
});

export const BoilerplateSchema = z.object({
	short: z.string(),
	medium: z.string(),
	long: z.string(),
});

export const CtaExampleSchema = z.object({
	context: z.string(),
	primary: z.string(),
	secondary: z.string().optional(),
});

export const CopywritingContentSchema = z.object({
	id: z.string(),
	identityId: z.string(),
	guidelineId: z.string(),

	slogans: z.array(SloganSchema),
	heroCopy: z.array(HeroCopySchema),
	channelMessages: z.array(ChannelMessageSchema),
	boilerplate: BoilerplateSchema,
	ctaExamples: z.array(CtaExampleSchema),
});

export type CopywritingContent = z.infer<typeof CopywritingContentSchema>;

// ============================================
// ApplicationsContent (Applications Agent 출력)
// ============================================
export const ApplicationExampleSchema = z.object({
	name: z.string(),
	description: z.string(),
	previewUrl: z.string().optional(),
});

export type ApplicationExample = z.infer<typeof ApplicationExampleSchema>;

export const ApplicationsContentSchema = z.object({
	id: z.string(),
	identityId: z.string(),
	guidelineId: z.string(),

	applications: z.object({
		digital: z.array(ApplicationExampleSchema),
		print: z.array(ApplicationExampleSchema),
		environmental: z.array(ApplicationExampleSchema).optional(),
	}),
});

export type ApplicationsContent = z.infer<typeof ApplicationsContentSchema>;

// ============================================
// BrandGuidelineDocument (최종 산출물)
// ============================================
export const CoverSchema = z.object({
	brandName: z.string(),
	documentTitle: z.string().optional(),
	tagline: z.string(),
	logoUrl: z.string(),
	date: z.string(),
});

export const ExhibitionLayoutSchema = z.object({
	pageRatio: z.literal("a4"),
	margins: z.literal("wide"),
	grid: z.literal("2-column"),
	oneTopicPerPage: z.boolean(),
	visualFirst: z.boolean(),
	background: z.literal("white"),
});

export const ExhibitionInteractionSchema = z.object({
	scrollMode: z.enum(["fullpage", "chapter"]),
	motionLevel: z.literal("minimal"),
	transitions: z.array(z.enum(["fade", "slide"])),
});

export const ExhibitionSectionsSchema = z.object({
	cover: z.object({
		layout: z.literal("centered"),
		elements: z.array(
			z.enum(["date", "brandName", "documentTitle", "tagline"]),
		),
	}),
	brandVision: z.object({
		layout: z.literal("two-column"),
		elements: z.array(
			z.enum([
				"visionStatement",
				"brandTruths",
				"categoryInsight",
				"consumerInsight",
				"targetDefinition",
			]),
		),
	}),
	identityStandards: z.object({
		layout: z.literal("stack"),
		elements: z.array(
			z.enum([
				"logo",
				"contourBottle",
				"dynamicRibbon",
				"coBranding",
				"legalLine",
			]),
		),
	}),
	logo: z.object({
		layout: z.literal("two-column"),
		variants: z.array(z.enum(["horizontal", "vertical"])),
		themes: z.array(z.enum(["light", "dark", "dual"])),
	}),
	symbolWordmark: z.object({
		layout: z.literal("two-column"),
		opacitySteps: z.array(z.number()).optional(),
	}),
	spacingSize: z.object({
		layout: z.literal("diagram"),
		format: z.enum(["svg", "image"]),
	}),
	colorPalette: z.object({
		layout: z.literal("grid"),
		cardFields: z.array(z.enum(["name", "hex", "cmyk", "pantone", "usage"])),
		ratioExamples: z.array(z.enum(["light", "dark"])),
	}),
	typography: z.object({
		layout: z.literal("stack"),
		previewCopy: z.array(z.string()),
	}),
	designStandards: z.object({
		layout: z.literal("grid"),
		sections: z.array(
			z.enum(["packaging", "signage", "fleet", "promotions", "customer"]),
		),
	}),
});

export const ExhibitionWebTemplateSchema = z.object({
	routes: z.array(z.string()),
	interactionNotes: z.array(z.string()),
});

export const ExhibitionSchema = z.object({
	layout: ExhibitionLayoutSchema,
	interaction: ExhibitionInteractionSchema,
	sections: ExhibitionSectionsSchema,
	webTemplate: ExhibitionWebTemplateSchema,
});

export const BrandOverviewSchema = z.object({
	mission: z.string(),
	vision: z.string(),
	values: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
		}),
	),
	personality: z.string(),
});

export const IdentityStandardsSectionSchema = z.object({
	logo: GuidelineModelSchema.shape.logo,
	brandElements: GuidelineModelSchema.shape.brandElements,
	standards: GuidelineModelSchema.shape.identityStandards,
});

export const SectionsSchema = z.object({
	brandVision: BrandVisionSchema,
	brandOverview: BrandOverviewSchema,
	identityStandards: IdentityStandardsSectionSchema,
	colorSystem: GuidelineModelSchema.shape.color,
	typography: GuidelineModelSchema.shape.typography,
	toneOfVoice: GuidelineModelSchema.shape.tone,
	copywriting: CopywritingContentSchema,
	visualElements: GuidelineModelSchema.shape.visual,
	designStandards: GuidelineModelSchema.shape.designStandards,
	applications: ApplicationsContentSchema.shape.applications,
});

export const SourceDataSchema = z.object({
	identityModel: IdentityModelSchema,
	guidelineModel: GuidelineModelSchema,
	copywritingContent: CopywritingContentSchema,
	applicationsContent: ApplicationsContentSchema,
	marketContext: MarketContextSchema,
	logoAsset: LogoAssetSchema,
});

export const BrandGuidelineDocumentSchema = z.object({
	id: z.string(),
	version: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),

	metadata: z.object({
		brandName: z.string(),
		generatedBy: z.string(),
		language: z.enum(["ko", "en", "both"]),
	}),

	cover: CoverSchema,
	exhibition: ExhibitionSchema,
	sections: SectionsSchema,
	sourceData: SourceDataSchema,
});

export type BrandGuidelineDocument = z.infer<
	typeof BrandGuidelineDocumentSchema
>;
