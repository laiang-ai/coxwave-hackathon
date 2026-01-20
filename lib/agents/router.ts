import type { AgentInputItem } from "@openai/agents";
import type { AgentId } from "./registry";
import { getAgent } from "./registry";

export type RouteStrategy = "auto" | "manual";

export type RouteDecision = {
	agentId: AgentId;
	reason: string;
};

// Brand-specific keywords for routing
const brandEditorKeywords = [
	"브랜드",
	"brand",
	"색상",
	"color",
	"컬러",
	"폰트",
	"font",
	"타이포그래피",
	"typography",
	"로고",
	"logo",
	"디자인",
	"design",
	"미션",
	"mission",
	"비전",
	"vision",
	"변경",
	"수정",
	"edit",
	"change",
	"update",
	"바꿔",
	"바꾸기",
	"primary",
	"secondary",
	"accent",
	"밝게",
	"어둡게",
	"darker",
	"lighter",
	"hex",
	"rgb",
	"가이드라인",
	"guideline",
];

type UserMessageItem = Extract<AgentInputItem, { role: "user" }>;

const getLastUserMessage = (messages: AgentInputItem[]) => {
	const reversed = [...messages].reverse();
	return reversed.find((item) => (item as UserMessageItem).role === "user") as
		| UserMessageItem
		| undefined;
};

const extractText = (message?: UserMessageItem) => {
	if (!message) return "";
	if (typeof message.content === "string") return message.content;
	return message.content
		.filter((part) => part.type === "input_text")
		.map((part) => part.text ?? "")
		.join(" ");
};

const matchesKeyword = (text: string, keywords: string[]) =>
	keywords.some((keyword) =>
		text.toLowerCase().includes(keyword.toLowerCase()),
	);

/**
 * Simple router for brand guideline editing
 * Routes to brand-editor agent if brand keywords are found, otherwise uses assistant
 */
export const routeAgent = (
	messages: AgentInputItem[],
	options?: {
		strategy?: RouteStrategy;
		preferredAgentId?: AgentId;
	},
) => {
	// Manual override
	if (options?.strategy === "manual" && options.preferredAgentId) {
		return {
			decision: {
				agentId: options.preferredAgentId,
				reason: "manual_override",
			},
			agent: getAgent(options.preferredAgentId),
		};
	}

	const lastUser = getLastUserMessage(messages);
	const text = extractText(lastUser);

	// Route to brand-editor if brand-related keywords detected
	if (matchesKeyword(text, brandEditorKeywords)) {
		return {
			decision: { agentId: "brand-editor", reason: "brand_editing_keyword" },
			agent: getAgent("brand-editor"),
		};
	}

	// Default to assistant for general queries
	return {
		decision: { agentId: "assistant", reason: "default" },
		agent: getAgent("assistant"),
	};
};
