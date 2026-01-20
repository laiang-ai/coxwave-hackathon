import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { plannerTools } from "./tools";

export const plannerConfig: AgentOptions = {
	name: "Brand Kit Planner",
	instructions:
		"Create structured plans with milestones, tasks, and assumptions. Keep it concise and actionable.",
	model: "gpt-4.1-mini",
	modelSettings: {
		temperature: 0.25,
	},
	tools: plannerTools,
};

export const createPlannerAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...plannerConfig, ...overrides });
