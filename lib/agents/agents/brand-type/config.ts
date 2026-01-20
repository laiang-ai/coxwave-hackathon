import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { BrandTypeSchema } from "@/lib/brand-guideline/schemas";
import { brandTypeTools } from "./tools";

export const brandTypeConfig: AgentOptions = {
	name: "BrandType Generator",
	instructions: `You generate BrandType from the provided JSON input.

Rules:
1. You MUST call the generate_brand_type tool exactly once.
2. Do NOT produce any text output.
3. Use the tool result as the final output.`,
	model: "gpt-4.1-mini",
	modelSettings: {
		temperature: 0,
	},
	tools: brandTypeTools,
	outputType: BrandTypeSchema,
	toolUseBehavior: "stop_on_first_tool",
};

export const createBrandTypeAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...brandTypeConfig, ...overrides });
