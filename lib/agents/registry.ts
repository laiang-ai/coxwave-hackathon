import type { Agent } from "@openai/agents";
// AGENT_IMPORTS_START
import { createAnalysisAgent } from "./agents/analysis";
import { createApplicationsAgent } from "./agents/applications";
import { createBrandEditorAgent } from "./agents/brand-editor";
import { createColorAgent } from "./agents/color";
import { createCopywritingAgent } from "./agents/copywriting";
import { createDesignStandardsAgent } from "./agents/design-standards";
import { createIdentityAgent } from "./agents/identity";
import { createLogoGuideAgent } from "./agents/logo-guide";
import { createPlannerAgent } from "./agents/planner";
import { createSummarizerAgent } from "./agents/summarizer";
import { createToneAgent } from "./agents/tone";
import { createTypographyAgent } from "./agents/typography";
import { createVisionAgent } from "./agents/vision";
import { createVisualAgent } from "./agents/visual";
import { createChatAgent } from "./graph";
import type { AgentFactory } from "./types";
// AGENT_IMPORTS_END

export const agentIds = [
	// AGENT_ID_START
	"assistant",
	"vision",
	"summarizer",
	"planner",
	"analysis",
	"identity",
	"logo-guide",
	"color",
	"typography",
	"tone",
	"visual",
	"design-standards",
	"copywriting",
	"applications",
	"brand-editor",
	// AGENT_ID_END
] as const;

export type AgentId = (typeof agentIds)[number];

const registry: Record<AgentId, AgentFactory> = {
	// AGENT_REGISTRY_START
	assistant: createChatAgent,
	vision: createVisionAgent,
	summarizer: createSummarizerAgent,
	planner: createPlannerAgent,
	analysis: createAnalysisAgent,
	identity: createIdentityAgent,
	"logo-guide": createLogoGuideAgent,
	color: createColorAgent,
	typography: createTypographyAgent,
	tone: createToneAgent,
	visual: createVisualAgent,
	"design-standards": createDesignStandardsAgent,
	copywriting: createCopywritingAgent,
	applications: createApplicationsAgent,
	"brand-editor": createBrandEditorAgent,
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
