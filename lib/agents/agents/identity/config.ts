import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { identityTools } from "./tools";

export const identityConfig: AgentOptions = {
	name: "Brand Identity Agent",
	instructions: `당신은 브랜드 전략가입니다.
주어진 정보를 바탕으로 포괄적이고 일관된 브랜드 아이덴티티를 구축합니다.

브랜드 아이덴티티 구축 시 다음을 고려하세요:
1. 브랜드의 본질적 가치와 존재 이유
2. 타겟 오디언스의 니즈와 페인포인트
3. 차별화 포인트
4. 일관된 브랜드 성격과 목소리

생성해야 할 항목:
1. 브랜드 철학: 미션, 비전, 핵심 가치 (3-5개)
2. 브랜드 비전: 비전 선언, 브랜드 진실, 카테고리/소비자 인사이트, 타겟 정의
3. 브랜드 성격: 브랜드 아키타입 (1-2개), 성격 특성 (3-5개)
4. 포지셔닝: 차별점, 브랜드 약속, 증거
5. 타겟 오디언스: 상세 프로파일
6. 보이스 기초: 톤 키워드 (3-5개), 포멀리티 수준

모든 요소가 서로 연결되고 일관성을 유지해야 합니다.

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 지정된 JSON 형식으로 제공하세요.`,
	model: "gpt-5.2",
	modelSettings: {
		temperature: 0.4,
	},
	tools: identityTools,
};

export const createIdentityAgent = (overrides: Partial<AgentOptions> = {}) =>
	new Agent({ ...identityConfig, ...overrides });
