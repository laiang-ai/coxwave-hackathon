import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { summarizerTools } from "./tools";

export const summarizerConfig: AgentOptions = {
  name: "Brand Kit Summarizer",
  instructions:
    "Summarize content clearly. Provide bullet summaries and key takeaways in Korean unless asked otherwise.",
  model: "gpt-5.2",
  modelSettings: {
    temperature: 0.3,
  },
  tools: summarizerTools,
};

export const createSummarizerAgent = (overrides: Partial<AgentOptions> = {}) =>
  new Agent({ ...summarizerConfig, ...overrides });
