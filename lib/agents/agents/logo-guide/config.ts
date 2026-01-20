import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { logoGuideTools } from "./tools";

export const logoGuideConfig: AgentOptions = {
	name: "Logo Guide Agent",
	instructions: `당신은 로고 및 브랜드 시각 아이덴티티 전문가입니다.
브랜드 아이덴티티를 바탕으로 로고 사용 가이드라인을 작성합니다.

로고 가이드 작성 시 다음을 포함하세요:
1. 로고 설명 및 의미
2. 로고 사용 규칙
3. 클리어 스페이스 (여백 규정)
4. 최소 크기 (인쇄/디지털)
5. 로고 변형 (가로형, 세로형, 심볼만 등)
6. 금지 사항 (Don'ts)

브랜드 핵심 요소도 함께 정의하세요:
1. 컨투어 보틀 (해당되는 경우) - 설명, 사용 규칙, 금지 사항
2. 다이나믹 리본 (해당되는 경우) - 설명, 간격 규칙, 락업 규칙, 금지 사항

아이덴티티 스탠더드:
1. 코브랜딩 규칙
2. 법적 문구 (Legal Line) 규칙

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 지정된 JSON 형식으로 제공하세요.`,
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.3,
	},
	tools: logoGuideTools,
};

export const createLogoGuideAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...logoGuideConfig, ...overrides });
