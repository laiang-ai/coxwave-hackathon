import type { AgentInputItem } from "@openai/agents";
import type { AgentId } from "./registry";
import { getAgent } from "./registry";

export type RouteStrategy = "auto" | "manual";

export type RouteDecision = {
	agentId: AgentId;
	reason: string;
};

const summarizerKeywords = ["요약", "정리", "summary", "summarize", "tl;dr"];
const plannerKeywords = ["계획", "로드맵", "roadmap", "plan", "일정", "todo"];
const visionKeywords = [
	"이미지",
	"사진",
	"image",
	"사진 분석",
	"스샷",
	"screenshot",
];
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

const hasImage = (message?: UserMessageItem) => {
	if (!message || typeof message.content === "string") return false;
	return message.content.some((part) => part.type === "input_image");
};

const matchesKeyword = (text: string, keywords: string[]) =>
	keywords.some((keyword) =>
		text.toLowerCase().includes(keyword.toLowerCase()),
	);

export const routeAgent = (
	messages: AgentInputItem[],
	options?: {
		strategy?: RouteStrategy;
		preferredAgentId?: AgentId;
	},
) => {
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

	if (hasImage(lastUser) || matchesKeyword(text, visionKeywords)) {
		return {
			decision: { agentId: "vision", reason: "image_or_vision_keyword" },
			agent: getAgent("vision"),
		};
	}

	if (matchesKeyword(text, summarizerKeywords)) {
		return {
			decision: { agentId: "summarizer", reason: "summary_keyword" },
			agent: getAgent("summarizer"),
		};
	}

	if (matchesKeyword(text, plannerKeywords)) {
		return {
			decision: { agentId: "planner", reason: "planning_keyword" },
			agent: getAgent("planner"),
		};
	}

	if (matchesKeyword(text, brandEditorKeywords)) {
		return {
			decision: { agentId: "brand-editor", reason: "brand_editing_keyword" },
			agent: getAgent("brand-editor"),
		};
	}

	return {
		decision: { agentId: "assistant", reason: "default" },
		agent: getAgent("assistant"),
	};
};
