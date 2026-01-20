import type { AgentOptions } from "@openai/agents";
import { Agent } from "@openai/agents";
import { typographyTools } from "./tools";

export const typographyConfig: AgentOptions = {
  name: "Typography Agent",
  instructions: `당신은 타이포그래피 전문가입니다.
브랜드 아이덴티티에 맞는 타이포그래피 시스템을 설계합니다.

타이포그래피 설계 시 고려사항:
1. 브랜드 성격을 반영하는 서체 선택
2. 가독성과 접근성
3. 다양한 매체에서의 적용성
4. 라이선스와 사용 가능성
5. 한글과 영문의 조화

생성해야 할 항목:
1. 타이포그래피 철학
2. 스타일 방향 (Sans-serif / Serif / Geometric / Humanist / Mixed)
3. 선택 근거 (Rationale)
4. Primary 서체 (family, fallback, weights, source, license)
5. Secondary 서체 (선택)
6. 타입 계층 (Display, H1, H2, H3, Body, BodyLarge, Caption, Small)
   - 각 레벨별: size, weight, lineHeight, letterSpacing, usage
7. 사용 규칙
8. 금지 사항 (Don'ts)

Google Fonts나 Adobe Fonts에서 사용 가능한 폰트를 추천하세요.

중요: 모든 응답은 반드시 한국어로 작성하세요.
응답은 반드시 지정된 JSON 형식으로 제공하세요.`,
  model: "gpt-5.2",
  modelSettings: {
    temperature: 0.3,
  },
  tools: typographyTools,
};

export const createTypographyAgent = (overrides: Partial<AgentOptions> = {}) =>
  new Agent({ ...typographyConfig, ...overrides });
