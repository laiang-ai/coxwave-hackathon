import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { summarizerTools } from "./tools";

export const summarizerConfig: AgentOptions = {
	name: "Coxwave Summarizer",
	instructions:
		"Summarize content clearly. Provide bullet summaries and key takeaways in Korean unless asked otherwise.",
	model: "gpt-4.1-mini",
	modelSettings: {
		temperature: 0.3,
	},
	tools: summarizerTools,
};

export const createSummarizerAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...summarizerConfig, ...overrides });
