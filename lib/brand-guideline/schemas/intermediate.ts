import { z } from "zod";

// ============================================
// LogoAsset
// ============================================
export const LogoAssetSchema = z.object({
	url: z.string(),
	format: z.enum(["png", "jpg", "svg"]),
	width: z.number(),
	height: z.number(),
});

export type LogoAsset = z.infer<typeof LogoAssetSchema>;

// ============================================
// LogoAnalysis (Vision Agent 출력)
// ============================================
export const LogoAnalysisSchema = z.object({
	visualElements: z.array(z.string()),
	colors: z.array(z.string()),
	shapes: z.array(z.string()),
	style: z.enum(["minimal", "complex", "geometric", "organic", "abstract"]),
	mood: z.array(z.string()),
	symbolism: z.string(),
});

export type LogoAnalysis = z.infer<typeof LogoAnalysisSchema>;

// ============================================
// MarketContext (Analysis Agent 출력)
// ============================================
export const MarketContextSchema = z.object({
	industryOverview: z.string(),
	categoryTrends: z.array(z.string()),
	audienceInsights: z.array(z.string()),
	opportunityAreas: z.array(z.string()),
});

export type MarketContext = z.infer<typeof MarketContextSchema>;

// ============================================
// IdentityModel (Identity Agent 출력)
// ============================================
export const BrandValueSchema = z.object({
	name: z.string(),
	description: z.string(),
	icon: z.string().optional(),
});

export const BrandVisionSchema = z.object({
	visionStatement: z.string(),
	brandTruths: z.array(z.string()),
	categoryInsight: z.string(),
	consumerInsight: z.string(),
	targetDefinition: z.string(),
});

export const PersonalitySchema = z.object({
	archetypes: z.object({
		primary: z.string(),
		secondary: z.string().optional(),
	}),
	traits: z.array(z.string()),
	humanDescription: z.string(),
});

export const PositioningSchema = z.object({
	category: z.string(),
	differentiator: z.string(),
	promise: z.string(),
	proof: z.array(z.string()),
});

export const PrimaryAudienceSchema = z.object({
	description: z.string(),
	demographics: z.array(z.string()),
	psychographics: z.array(z.string()),
	painPoints: z.array(z.string()),
	goals: z.array(z.string()),
});

export const SecondaryAudienceSchema = z.object({
	description: z.string(),
	demographics: z.array(z.string()),
});

export const VoiceFoundationSchema = z.object({
	toneKeywords: z.array(z.string()),
	formalityLevel: z.enum(["formal", "professional", "casual", "friendly"]),
	energyLevel: z.enum(["calm", "balanced", "dynamic", "energetic"]),
});

export const IdentityModelSchema = z.object({
	id: z.string(),
	createdAt: z.coerce.date(),

	// 브랜드 기본 정보
	brand: z.object({
		name: z.string(),
		tagline: z.string(),
		oneLiner: z.string(),
		description: z.string(),
	}),

	// 브랜드 철학
	philosophy: z.object({
		mission: z.string(),
		vision: z.string(),
		purpose: z.string(),
		values: z.array(BrandValueSchema),
	}),

	// 브랜드 비전
	brandVision: BrandVisionSchema,

	// 브랜드 성격
	personality: PersonalitySchema,

	// 포지셔닝
	positioning: PositioningSchema,

	// 타겟 오디언스
	targetAudience: z.object({
		primary: PrimaryAudienceSchema,
		secondary: SecondaryAudienceSchema.optional(),
	}),

	// 보이스 기초
	voiceFoundation: VoiceFoundationSchema,

	// 로고 분석 결과
	logoAnalysis: LogoAnalysisSchema,
});

export type IdentityModel = z.infer<typeof IdentityModelSchema>;

// ============================================
// GuidelineModel (Guideline Agents 출력)
// ============================================

// Color 관련
export const ColorSpecSchema = z.object({
	name: z.string(),
	hex: z.string(),
	rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }),
	cmyk: z
		.object({ c: z.number(), m: z.number(), y: z.number(), k: z.number() })
		.optional(),
	pantone: z.string().optional(),
	usage: z.string(),
	meaning: z.string().optional(),
});

export type ColorSpec = z.infer<typeof ColorSpecSchema>;

export const ColorCombinationSchema = z.object({
	name: z.string(),
	colors: z.array(z.string()),
	usage: z.string(),
});

export const ContrastRatioSchema = z.object({
	combination: z.string(),
	ratio: z.string(),
	wcagLevel: z.enum(["AA", "AAA"]),
});

// Typography 관련
export const TypographySpecSchema = z.object({
	size: z.string(),
	weight: z.string(),
	lineHeight: z.string(),
	letterSpacing: z.string().optional(),
	usage: z.string(),
});

export type TypographySpec = z.infer<typeof TypographySpecSchema>;

export const TypeHierarchySchema = z.object({
	display: TypographySpecSchema.optional(),
	h1: TypographySpecSchema,
	h2: TypographySpecSchema,
	h3: TypographySpecSchema,
	body: TypographySpecSchema,
	bodyLarge: TypographySpecSchema.optional(),
	caption: TypographySpecSchema,
	small: TypographySpecSchema.optional(),
});

export type TypeHierarchy = z.infer<typeof TypeHierarchySchema>;

// Tone 관련
export const TonePrincipleSchema = z.object({
	name: z.string(),
	description: z.string(),
	example: z.string(),
});

export const ToneExampleSchema = z.object({
	context: z.string(),
	do: z.array(
		z.object({
			text: z.string(),
			explanation: z.string(),
		}),
	),
	dont: z.array(
		z.object({
			text: z.string(),
			explanation: z.string(),
		}),
	),
});

// Logo Variation
export const LogoVariationSchema = z.object({
	name: z.string(),
	usage: z.string(),
});

// GuidelineModel 전체
export const GuidelineModelSchema = z.object({
	id: z.string(),
	identityId: z.string(),
	createdAt: z.coerce.date(),

	// 로고 사용 가이드
	logo: z.object({
		description: z.string(),
		usageRules: z.array(z.string()),
		clearSpace: z.object({
			description: z.string(),
			ratio: z.string(),
		}),
		minimumSize: z.object({
			print: z.string(),
			digital: z.string(),
		}),
		variations: z.array(LogoVariationSchema),
		donts: z.array(z.string()),
	}),

	// 브랜드 핵심 요소
	brandElements: z.object({
		contourBottle: z.object({
			description: z.string(),
			usageRules: z.array(z.string()),
			clearSpace: z.string().optional(),
			donts: z.array(z.string()),
		}),
		dynamicRibbon: z.object({
			description: z.string(),
			spacingRules: z.array(z.string()),
			lockupRules: z.array(z.string()),
			donts: z.array(z.string()),
		}),
	}),

	// 아이덴티티 스탠더드
	identityStandards: z.object({
		coBranding: z.object({
			rules: z.array(z.string()),
			clearSpaceRatio: z.string().optional(),
			alignmentRules: z.array(z.string()).optional(),
		}),
		legalLine: z.object({
			required: z.boolean(),
			rules: z.array(z.string()),
			examples: z.array(z.string()),
		}),
	}),

	// 컬러 시스템
	color: z.object({
		philosophy: z.string(),
		primary: z.array(ColorSpecSchema),
		secondary: z.array(ColorSpecSchema),
		neutral: z.array(ColorSpecSchema),
		accent: z.array(ColorSpecSchema).optional(),
		combinations: z.array(ColorCombinationSchema),
		accessibility: z.object({
			contrastRatios: z.array(ContrastRatioSchema),
		}),
		donts: z.array(z.string()),
	}),

	// 타이포그래피
	typography: z.object({
		philosophy: z.string(),
		direction: z.enum([
			"sans-serif",
			"serif",
			"geometric",
			"humanist",
			"mixed",
		]),
		rationale: z.string(),
		primary: z.object({
			family: z.string(),
			fallback: z.array(z.string()),
			weights: z.array(z.string()),
			source: z.string(),
			license: z.string(),
		}),
		secondary: z
			.object({
				family: z.string(),
				usage: z.string(),
			})
			.optional(),
		hierarchy: TypeHierarchySchema,
		rules: z.array(z.string()),
		donts: z.array(z.string()),
	}),

	// 톤 오브 보이스
	tone: z.object({
		overview: z.string(),
		principles: z.array(TonePrincipleSchema),
		writingStyle: z.object({
			characteristics: z.array(z.string()),
			rules: z.array(z.string()),
		}),
		examples: z.array(ToneExampleSchema),
		vocabulary: z.object({
			preferred: z.array(z.string()),
			avoided: z.array(z.string()),
		}),
	}),

	// 디자인 스탠더드
	designStandards: z.object({
		packaging: z.object({
			graphicRules: z.array(z.string()),
			formRules: z.array(z.string()),
			templates: z.array(z.string()).optional(),
		}),
		signage: z.object({
			rules: z.array(z.string()),
		}),
		fleet: z.object({
			rules: z.array(z.string()),
		}),
		promotions: z.object({
			rules: z.array(z.string()),
		}),
		customer: z.object({
			rules: z.array(z.string()),
		}),
	}),

	// 비주얼 요소
	visual: z.object({
		imagery: z.object({
			style: z.string(),
			characteristics: z.array(z.string()),
			subjects: z.array(z.string()),
			treatments: z.array(z.string()),
			donts: z.array(z.string()),
		}),
		iconography: z
			.object({
				style: z.string(),
				strokeWidth: z.string().optional(),
				cornerRadius: z.string().optional(),
				guidelines: z.array(z.string()),
			})
			.optional(),
		layout: z.object({
			gridSystem: z.string(),
			margins: z.string(),
			spacing: z.object({
				unit: z.string(),
				scale: z.array(z.string()),
			}),
		}),
	}),
});

export type GuidelineModel = z.infer<typeof GuidelineModelSchema>;
