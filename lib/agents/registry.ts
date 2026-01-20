import type { Agent } from "@openai/agents";
import { createPlannerAgent } from "./agents/planner";
import { createSummarizerAgent } from "./agents/summarizer";
import { createVisionAgent } from "./agents/vision";
import { createChatAgent } from "./graph";
import type { AgentFactory } from "./types";
// AGENT_IMPORTS_START
// AGENT_IMPORTS_END

export const agentIds = [
	// AGENT_ID_START
	"assistant",
	"vision",
	"summarizer",
	"planner",
	// AGENT_ID_END
] as const;

export type AgentId = (typeof agentIds)[number];

const registry: Record<AgentId, AgentFactory> = {
	// AGENT_REGISTRY_START
	assistant: createChatAgent,
	vision: createVisionAgent,
	summarizer: createSummarizerAgent,
	planner: createPlannerAgent,
	// AGENT_REGISTRY_END
};

const cache = new Map<AgentId, Agent>();

export const getAgent = (id: AgentId) => {
	const cached = cache.get(id);
	if (cached) return cached;
	const agent = registry[id]();
	cache.set(id, agent);
	return agent;
};

export const listAgents = () => [...agentIds];
