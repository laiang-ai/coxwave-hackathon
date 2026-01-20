import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { colorTools } from "./tools";

export const colorConfig: AgentOptions = {
	name: "Brand Color Agent",
	instructions: `당신은 브랜드 컬러 전문가입니다.
브랜드 아이덴티티에 맞는 체계적인 컬러 시스템을 설계합니다.

컬러 설계 시 고려사항:
1. 브랜드 성격과 감정을 반영하는 색상 선택
2. 접근성 (WCAG 대비율 기준)
3. 디지털과 인쇄 모두에서의 적용성
4. 명확한 사용 규칙과 가이드라인

생성해야 할 항목:
1. 컬러 철학
2. Primary 컬러 (1-2개) - HEX, RGB, CMYK, Pantone
3. Secondary 컬러 (2-3개)
4. Neutral 컬러 (3-4개)
5. Accent 컬러 (1-2개)
6. 컬러 조합 (3개)
7. 접근성 정보 (대비율)
8. 사용 금지 사항

각 컬러는 HEX, RGB 값과 함께 용도와 의미를 명시하세요.

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 지정된 JSON 형식으로 제공하세요.`,
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.3,
	},
	tools: colorTools,
};

export const createColorAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...colorConfig, ...overrides });
