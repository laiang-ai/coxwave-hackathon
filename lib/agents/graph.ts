import { Agent } from "@openai/agents";
import { assistantConfig } from "./agents/assistant/config";
import { createPlannerAgent } from "./agents/planner";
import { createSummarizerAgent } from "./agents/summarizer";
import { createVisionAgent } from "./agents/vision";

export const createChatAgent = () =>
  new Agent({
    ...assistantConfig,
    handoffDescription:
      "Delegate to specialist agents when the request involves images, summarization, or planning.",
    handoffs: [
      createVisionAgent(),
      createSummarizerAgent(),
      createPlannerAgent(),
    ],
  });
