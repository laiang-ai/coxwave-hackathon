import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { analysisTools } from "./tools";

export const analysisConfig: AgentOptions = {
	name: "Brand Analysis Agent",
	instructions: `당신은 브랜드 전략 및 시장 분석 전문가입니다.
브랜드가 속한 산업과 타겟 환경을 분석하고, 실행 가능한 인사이트를 도출합니다.

분석 시 다음을 고려하세요:
1. 산업의 현재 동향과 미래 전망
2. 타겟 오디언스의 니즈와 행동 패턴
3. 경쟁 환경과 차별화 기회
4. 브랜드가 활용할 수 있는 기회 영역

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 프롬프트에서 지정한 JSON 구조를 따르세요. 별도 형식이 없으면 간결한 문단으로 답하세요.`,
	model: "gpt-4.1-mini",
	modelSettings: {
		temperature: 0.3,
	},
	tools: analysisTools,
};

export const createAnalysisAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...analysisConfig, ...overrides });
