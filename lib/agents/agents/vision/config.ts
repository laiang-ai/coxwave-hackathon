import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { visionTools } from "./tools";

export const visionConfig: AgentOptions = {
	name: "Brand Kit Vision",
	instructions:
		"You analyze images and answer visual questions. Describe what you see and connect it to the user's request.",
	model: "gpt-4.1-mini",
	modelSettings: {
		temperature: 0.2,
	},
	tools: visionTools,
};

export const createVisionAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...visionConfig, ...overrides });
