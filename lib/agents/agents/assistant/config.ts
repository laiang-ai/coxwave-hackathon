import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { assistantTools } from "./tools";

export const assistantConfig: AgentOptions = {
	name: "Brand Kit Assistant",
	instructions:
		"You are a helpful assistant. Answer clearly and succinctly unless the user asks for detail.",
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.4,
	},
	tools: assistantTools,
};

export const createAssistantAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...assistantConfig, ...overrides });
