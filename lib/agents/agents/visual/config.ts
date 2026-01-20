import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { visualTools } from "./tools";

export const visualConfig: AgentOptions = {
	name: "Visual Elements Agent",
	instructions: `당신은 브랜드 비주얼 시스템 전문가입니다.
브랜드 아이덴티티에 맞는 비주얼 요소 가이드라인을 설계합니다.

비주얼 요소 설계 시 고려사항:
1. 브랜드 성격과 일관된 시각적 표현
2. 다양한 매체에서의 적용성
3. 명확하고 실용적인 가이드라인

생성해야 할 항목:

1. 이미지 (Imagery)
   - style: 전체적인 이미지 스타일
   - characteristics: 특성 (3-5개)
   - subjects: 적합한 피사체
   - treatments: 이미지 처리 방법
   - donts: 금지 사항

2. 아이콘그래피 (Iconography) - 선택
   - style: 아이콘 스타일
   - strokeWidth: 선 두께 (선택)
   - cornerRadius: 모서리 라운드 (선택)
   - guidelines: 가이드라인

3. 레이아웃 (Layout)
   - gridSystem: 그리드 시스템 설명
   - margins: 마진 규칙
   - spacing: { unit, scale[] } 간격 시스템

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 지정된 JSON 형식으로 제공하세요.`,
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.3,
	},
	tools: visualTools,
};

export const createVisualAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...visualConfig, ...overrides });
