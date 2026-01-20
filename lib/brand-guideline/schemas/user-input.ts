import { z } from "zod";

export const ToneOptionSchema = z.enum([
	"전문적인",
	"친근한",
	"혁신적인",
	"신뢰감있는",
	"세련된",
	"따뜻한",
	"역동적인",
	"차분한",
	"유머러스한",
	"고급스러운",
]);

export type ToneOption = z.infer<typeof ToneOptionSchema>;

export const PreferencesSchema = z.object({
	colorMood: z
		.enum(["vibrant", "muted", "bold", "subtle", "warm", "cool"])
		.optional(),
	typographyStyle: z
		.enum(["modern", "classic", "playful", "minimal"])
		.optional(),
	formalityLevel: z
		.enum(["formal", "professional", "casual", "friendly"])
		.optional(),
	language: z.enum(["ko", "en", "both"]).optional(),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const UserInputSchema = z.object({
	// 필수 입력
	brandName: z.string().min(1).max(50),
	industry: z.string().min(1),
	oneLiner: z.string().min(10).max(200),
	logoDataUrl: z.string(), // base64 data URL

	// 선택 입력 (권장)
	keywords: z.array(z.string()).min(3).max(5).optional(),
	targetAudience: z.string().optional(),
	toneReference: z.array(ToneOptionSchema).optional(),

	// 선택 입력 (상세)
	vision: z.string().max(300).optional(),
	mission: z.string().max(300).optional(),
	prohibitedExpressions: z.array(z.string()).max(10).optional(),
	additionalContext: z.string().optional(),

	// 선호도 설정
	preferences: PreferencesSchema.optional(),
});

export type UserInput = z.infer<typeof UserInputSchema>;
