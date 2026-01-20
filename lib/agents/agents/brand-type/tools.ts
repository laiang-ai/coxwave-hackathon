import { tool } from "@openai/agents";
import { z } from "zod";
import {
	BrandTypeSchema,
	GuidelineModelSchema,
	IdentityModelSchema,
	LogoAssetSchema,
} from "@/lib/brand-guideline/schemas";
import { toBrandType } from "@/lib/brand-guideline/transformer";

const generateBrandTypeTool = tool({
	name: "generate_brand_type",
	description: "Generate BrandType from identity, guideline, and logoAsset.",
	parameters: z.object({
		identity: IdentityModelSchema,
		guideline: GuidelineModelSchema,
		logoAsset: LogoAssetSchema,
	}),
	execute: async ({ identity, guideline, logoAsset }) => {
		const brandType = toBrandType(identity, guideline, logoAsset);
		return BrandTypeSchema.parse(brandType);
	},
});

export const brandTypeTools = [generateBrandTypeTool];
