import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { visionTools } from "./tools";

export const visionConfig: AgentOptions = {
	name: "Brand Kit Vision",
	instructions: `당신은 이미지 분석 전문가입니다.
이미지를 분석하고 시각적 질문에 답변합니다. 보이는 것을 설명하고 사용자의 요청과 연결하세요.

중요: 모든 응답은 반드시 한국어로 작성하세요.`,
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.2,
	},
	tools: visionTools,
};

export const createVisionAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...visionConfig, ...overrides });
