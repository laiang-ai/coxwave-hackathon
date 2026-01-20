# 에이전트 실행 흐름 (Agent Execution Flow)

> 이 문서는 브랜드 가이드라인 생성 시스템에서 입력 데이터가 에이전트에 전달되고 실행되는 흐름을 설명합니다.

---

## 목차

1. [전체 아키텍처](#전체-아키텍처)
2. [워크플로우 실행 흐름](#워크플로우-실행-흐름)
3. [Phase별 상세 흐름](#phase별-상세-흐름)
4. [단일 에이전트 실행 흐름](#단일-에이전트-실행-흐름)
5. [데이터 흐름 다이어그램](#데이터-흐름-다이어그램)
6. [주요 파일 참조](#주요-파일-참조)

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              System Architecture                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────┐     ┌──────────────────────────────┐
│   Frontend   │────▶│   API Route      │────▶│   Workflow Orchestrator      │
│  (Next.js)   │     │  /api/brand-     │     │   runBrandWorkflow()         │
│              │     │  guideline/      │     │                              │
└──────────────┘     │  generate        │     │  ┌────────────────────────┐  │
                     └──────────────────┘     │  │  Agent Execution Layer │  │
                                              │  │  @openai/agents SDK    │  │
                                              │  └────────────────────────┘  │
                                              └──────────────────────────────┘
                                                             │
                                                             ▼
                                              ┌──────────────────────────────┐
                                              │      OpenAI GPT Models       │
                                              │      (gpt-4.1-mini, gpt-4.1-mini) │
                                              └──────────────────────────────┘
```

### 핵심 컴포넌트

| 컴포넌트              | 파일 경로                                      | 역할                                       |
| --------------------- | ---------------------------------------------- | ------------------------------------------ |
| Workflow Orchestrator | `lib/brand-guideline/orchestrator/workflow.ts` | 전체 워크플로우 제어 및 에이전트 실행 조율 |
| Agent Registry        | `lib/agents/registry.ts`                       | 에이전트 팩토리 함수 관리 및 캐싱          |
| Agent Configs         | `lib/agents/agents/*/config.ts`                | 각 에이전트의 설정 (프롬프트, 모델, 도구)  |
| Schemas               | `lib/brand-guideline/schemas/`                 | 입출력 데이터 타입 정의 (Zod)              |

---

## 워크플로우 실행 흐름

### Entry Point

```typescript
// lib/brand-guideline/orchestrator/workflow.ts:381
export async function* runBrandWorkflow(
  input: UserInput,
  logoAsset: LogoAsset,
): AsyncGenerator<WorkflowEvent>
```

워크플로우는 **AsyncGenerator** 패턴을 사용하여 각 단계의 진행 상황을 실시간으로 스트리밍합니다.

### 입력 데이터 구조

```typescript
// UserInput (lib/brand-guideline/schemas/user-input.ts)
{
  brandName: string;           // 브랜드명 (필수)
  industry: string;            // 산업/카테고리 (필수)
  oneLiner: string;            // 한줄 정의 (필수)
  logoDataUrl: string;         // 로고 이미지 data URL (필수)
  keywords?: string[];         // 핵심 키워드 (3-5개)
  targetAudience?: string;     // 타겟 오디언스 설명
  toneReference?: string[];    // 톤 레퍼런스
  vision?: string;             // 브랜드 비전
  mission?: string;            // 브랜드 미션
  prohibitedExpressions?: string[];  // 금지 표현
  additionalContext?: string;  // 추가 컨텍스트
  preferences?: {
    colorMood?: string;        // 선호 색상 무드
    typographyStyle?: string;  // 선호 타이포그래피 스타일
    formalityLevel?: string;   // 포멀리티 레벨
    language?: string;         // 응답 언어
  }
}

// LogoAsset
{
  url: string;      // 로고 이미지 URL
  format: string;   // png | jpg | svg
  width: number;    // 이미지 너비
  height: number;   // 이미지 높이
}
```

---

## Phase별 상세 흐름

### Phase 1: Logo Asset (로고 에셋 처리)

```
입력: LogoAsset (이미 제공됨)
출력: phase-complete 이벤트
```

### Phase 2: Analysis (분석) - 병렬 실행

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2: ANALYSIS                            │
│                    (Promise.all - 병렬 실행)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     Vision Agent        │         │    Analysis Agent       │
│  (runVisionAgent)       │         │  (runAnalysisAgent)     │
├─────────────────────────┤         ├─────────────────────────┤
│ INPUT:                  │         │ INPUT:                  │
│ • UserInput.brandName   │         │ • UserInput.brandName   │
│ • UserInput.industry    │         │ • UserInput.industry    │
│ • LogoAsset.url         │         │ • UserInput.keywords    │
│                         │         │ • UserInput.target      │
├─────────────────────────┤         ├─────────────────────────┤
│ OUTPUT: LogoAnalysis    │         │ OUTPUT: MarketContext   │
│ • visualElements[]      │         │ • industryOverview      │
│ • colors[] (HEX)        │         │ • categoryTrends[]      │
│ • shapes[]              │         │ • audienceInsights[]    │
│ • style                 │         │ • opportunityAreas[]    │
│ • mood[]                │         │                         │
│ • symbolism             │         │                         │
└─────────────────────────┘         └─────────────────────────┘
```

### Phase 3: Identity (아이덴티티 생성)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: IDENTITY                            │
│                    (순차 실행 - 이전 결과 의존)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │    Identity Agent       │
                │  (runIdentityAgent)     │
                ├─────────────────────────┤
                │ INPUT:                  │
                │ • UserInput (전체)      │
                │ • LogoAnalysis          │
                │ • MarketContext         │
                ├─────────────────────────┤
                │ OUTPUT: IdentityModel   │
                │ • brand.philosophy      │
                │ • brand.vision          │
                │ • personality           │
                │ • positioning           │
                │ • targetAudience        │
                │ • voiceFoundation       │
                │ • logoAnalysis          │
                └─────────────────────────┘
```

### Phase 4: Guidelines (가이드라인 생성) - 6개 에이전트 병렬

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 4: GUIDELINES                          │
│                    (Promise.all - 6개 병렬 실행)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
   ┌──────────┬──────────┬────┴────┬──────────┬──────────┐
   ▼          ▼          ▼         ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐
│Logo  │  │Color │  │Typo  │  │Tone  │  │Visual│  │Design    │
│Guide │  │Agent │  │Agent │  │Agent │  │Agent │  │Standards │
├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────────┤
│INPUT:│  │INPUT:│  │INPUT:│  │INPUT:│  │INPUT:│  │INPUT:    │
│Ident-│  │Ident-│  │Ident-│  │Ident-│  │Ident-│  │Identity  │
│ity   │  │ity + │  │ity + │  │ity + │  │ity   │  │JSON      │
│JSON  │  │colors│  │brand │  │voice │  │JSON  │  │          │
│      │  │+color│  │traits│  │found.│  │      │  │          │
│      │  │Mood  │  │+typo │  │+禁止 │  │      │  │          │
│      │  │      │  │Style │  │표현  │  │      │  │          │
├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────────┤
│OUT:  │  │OUT:  │  │OUT:  │  │OUT:  │  │OUT:  │  │OUT:      │
│logo  │  │color │  │typo- │  │tone  │  │visual│  │design    │
│brand │  │      │  │graphy│  │      │  │      │  │Standards │
│Elem. │  │      │  │      │  │      │  │      │  │          │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────────┘
        │          │          │          │          │          │
        └──────────┴──────────┴────┬─────┴──────────┴──────────┘
                                   ▼
                         ┌─────────────────────┐
                         │   GuidelineModel    │
                         │ (통합된 가이드라인)  │
                         └─────────────────────┘
```

### Phase 5: Content (콘텐츠 생성) - Mockup Studio에서 별도 실행

> **참고**: Phase 5는 메인 워크플로우에서 자동 실행되지 않습니다.
> Mockup Studio에서 "generate mockup" 클릭 시 `runContentAgents()` 함수를 호출하여 별도로 실행합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 5: CONTENT                             │
│           (Mockup Studio에서 별도 실행 - runContentAgents)       │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│  Copywriting Agent      │       │  Applications Agent     │
├─────────────────────────┤       ├─────────────────────────┤
│ INPUT:                  │       │ INPUT:                  │
│ • IdentityModel JSON    │       │ • IdentityModel JSON    │
│ • GuidelineModel.tone   │       │ • GuidelineModel JSON   │
├─────────────────────────┤       ├─────────────────────────┤
│ OUTPUT:                 │       │ OUTPUT:                 │
│ CopywritingContent      │       │ ApplicationsContent     │
│ • slogans[]             │       │ • digital[] (3개)       │
│ • headlines[]           │       │ • print[] (2개)         │
│ • bodyCopy[]            │       │ • environmental[] (1-2) │
│ • cta[]                 │       │                         │
└─────────────────────────┘       └─────────────────────────┘
```

---

## 단일 에이전트 실행 흐름

각 에이전트는 동일한 패턴으로 실행됩니다.

````
┌────────────────────────────────────────────────────────────────────────┐
│                    Single Agent Execution Flow                          │
└────────────────────────────────────────────────────────────────────────┘

  Step 1: Agent 인스턴스 생성
  ───────────────────────────────────────────────────────────────────────

  const agent = createXxxAgent();

  ┌─────────────────────────────────────┐
  │  AgentConfig (config.ts)            │
  │  ─────────────────────────────────  │
  │  • name: "Xxx Agent"                │
  │  • instructions: "시스템 프롬프트..." │
  │  • model: "gpt-4o" | "gpt-4o-mini"  │
  │  • modelSettings: { temperature }   │
  │  • tools: [tool1, tool2, ...]       │
  └─────────────────────────────────────┘
                    │
                    ▼
  Step 2: 프롬프트 구성 (입력 데이터 직렬화)
  ───────────────────────────────────────────────────────────────────────

  const prompt = `다음 정보를 바탕으로 분석해주세요.

  ## 브랜드 아이덴티티
  ${JSON.stringify(identity, null, 2)}

  ## 추가 정보
  ${input.preferences?.colorMood || "없음"}

  JSON 형식으로 응답해주세요.`;

                    │
                    ▼
  Step 3: 에이전트 실행 (@openai/agents SDK)
  ───────────────────────────────────────────────────────────────────────

  const result = await run(agent, prompt);

  ┌─────────────────────────────────────────────────────────────────────┐
  │                       @openai/agents SDK                            │
  │  ───────────────────────────────────────────────────────────────── │
  │                                                                     │
  │  1. Agent의 instructions(시스템 프롬프트) 설정                       │
  │  2. 사용자 프롬프트(prompt) 전달                                     │
  │  3. LLM 호출 (OpenAI API)                                           │
  │  4. Tool Call이 필요하면 도구 실행 후 재호출                          │
  │  5. 최종 응답 반환 → result.finalOutput                             │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
  Step 4: 결과 파싱 및 검증
  ───────────────────────────────────────────────────────────────────────

  // JSON 추출
  const json = extractJson(result.finalOutput || "");

  // Zod 스키마로 타입 검증
  return XxxSchema.parse(json);

  ┌─────────────────────────────────────┐
  │  extractJson() 로직               │
  │  ─────────────────────────────────  │
  │  1. ```json ... ``` 블록 찾기      │
  │  2. 없으면 전체 텍스트 JSON 파싱   │
  │  3. 실패 시 에러 throw             │
  └─────────────────────────────────────┘
````

---

## 데이터 흐름 다이어그램

### 전체 데이터 흐름

```
                              ┌─────────────────┐
                              │   UserInput     │
                              │   + LogoAsset   │
                              └────────┬────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          │
    ┌───────────────┐          ┌───────────────┐                  │
    │ Vision Agent  │          │Analysis Agent │                  │
    └───────┬───────┘          └───────┬───────┘                  │
            │                          │                          │
            ▼                          ▼                          │
    ┌───────────────┐          ┌───────────────┐                  │
    │  LogoAnalysis │          │ MarketContext │                  │
    └───────┬───────┘          └───────┬───────┘                  │
            │                          │                          │
            └──────────────┬───────────┘                          │
                           │                                      │
                           ▼                                      │
                   ┌───────────────┐                              │
                   │Identity Agent │◀─────────────────────────────┘
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ IdentityModel │
                   └───────┬───────┘
                           │
    ┌──────────────────────┼──────────────────────────────────────┐
    │      │       │       │       │       │       │              │
    ▼      ▼       ▼       ▼       ▼       ▼       ▼              │
  Logo   Color   Typo    Tone   Visual Design  ◀─ (UserInput도 일부 참조)
  Guide  Agent   Agent   Agent  Agent  Stds
    │      │       │       │       │       │
    └──────┴───────┴───┬───┴───────┴───────┘
                       │
                       ▼
               ┌───────────────┐
               │GuidelineModel │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │   complete    │ ← /brand 페이지로 리다이렉트
               └───────────────┘

  ─────────────────────────────────────────────────────────────
  │  Phase 5: Mockup Studio에서 별도 실행 (runContentAgents)  │
  ─────────────────────────────────────────────────────────────
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
  ┌───────────────┐         ┌───────────────┐
  │  Copywriting  │         │ Applications  │
  │     Agent     │         │    Agent      │
  └───────┬───────┘         └───────┬───────┘
          │                         │
          ▼                         ▼
  ┌───────────────┐         ┌───────────────┐
  │ Copywriting   │         │ Applications  │
  │   Content     │         │   Content     │
  └───────────────┘         └───────────────┘
```

### 최종 출력

```typescript
// WorkflowEvent (type: "complete")
// 메인 워크플로우 (Phase 1-4)
{
  type: "complete",
  data: {
    identity: IdentityModel,
    guideline: GuidelineModel,
    logoAsset: LogoAsset,
    marketContext: MarketContext,
    // Phase 5는 Mockup Studio에서 별도 실행
    copywriting?: CopywritingContent,  // optional
    applications?: ApplicationsContent  // optional
  }
}
```

---

## 주요 파일 참조

### Workflow & Orchestration

| 파일                                           | 설명                  |
| ---------------------------------------------- | --------------------- |
| `lib/brand-guideline/orchestrator/workflow.ts` | 메인 워크플로우 정의  |
| `lib/brand-guideline/orchestrator/index.ts`    | 오케스트레이터 진입점 |

### Agent Definitions

| 에이전트         | Config 파일                                    | 역할                   |
| ---------------- | ---------------------------------------------- | ---------------------- |
| Vision           | `lib/agents/agents/vision/config.ts`           | 로고 이미지 분석       |
| Analysis         | `lib/agents/agents/analysis/config.ts`         | 시장/타겟 분석         |
| Identity         | `lib/agents/agents/identity/config.ts`         | 브랜드 아이덴티티 생성 |
| Logo Guide       | `lib/agents/agents/logo-guide/config.ts`       | 로고 가이드라인        |
| Color            | `lib/agents/agents/color/config.ts`            | 컬러 시스템 설계       |
| Typography       | `lib/agents/agents/typography/config.ts`       | 타이포그래피 시스템    |
| Tone             | `lib/agents/agents/tone/config.ts`             | 톤 오브 보이스         |
| Visual           | `lib/agents/agents/visual/config.ts`           | 비주얼 요소 가이드     |
| Design Standards | `lib/agents/agents/design-standards/config.ts` | 디자인 스탠더드        |
| Copywriting      | `lib/agents/agents/copywriting/config.ts`      | 카피라이팅             |
| Applications     | `lib/agents/agents/applications/config.ts`     | 적용 사례 설계         |

### Schemas

| 파일                                          | 설명               |
| --------------------------------------------- | ------------------ |
| `lib/brand-guideline/schemas/user-input.ts`   | 사용자 입력 스키마 |
| `lib/brand-guideline/schemas/intermediate.ts` | 중간 데이터 모델   |
| `lib/brand-guideline/schemas/output.ts`       | 최종 출력 스키마   |

### Infrastructure

| 파일                     | 설명                                |
| ------------------------ | ----------------------------------- |
| `lib/agents/registry.ts` | 에이전트 등록 및 캐싱               |
| `lib/agents/graph.ts`    | 채팅 에이전트 그래프 (handoff 포함) |

---

## 이벤트 스트리밍

워크플로우는 `AsyncGenerator`를 사용하여 진행 상황을 실시간으로 스트리밍합니다.

```typescript
type WorkflowEvent =
  | { type: "phase-start"; phase: WorkflowPhase; message: string }
  | { type: "phase-complete"; phase: WorkflowPhase; message: string }
  | { type: "agent-start"; agent: string; message: string }
  | { type: "agent-complete"; agent: string; message: string }
  | { type: "complete"; data: { ... } }
  | { type: "error"; error: string };
```

### 이벤트 순서 예시

```
# 메인 워크플로우 (Phase 1-4)
1. phase-complete: logo-asset
2. phase-start: analysis
3. agent-start: vision
4. agent-start: analysis
5. agent-complete: vision
6. agent-complete: analysis
7. phase-complete: analysis
8. phase-start: identity
9. agent-start: identity
10. agent-complete: identity
11. phase-complete: identity
12. phase-start: guidelines
13. agent-start: logo-guide, color, typography, tone, visual, design-standards
14. agent-complete: (각 에이전트)
15. phase-complete: guidelines
16. complete: { data: ... }  ← /brand 페이지로 리다이렉트

# Phase 5 (Mockup Studio에서 별도 실행)
# runContentAgents() 호출 시:
1. phase-start: content
2. agent-start: copywriting, applications
3. agent-complete: copywriting, applications
4. phase-complete: content
```

---

## 신뢰성 & 복구 전략

- Phase 2~5 호출은 지수 백오프 재시도(`withRetry`)로 일시적 오류를 완화합니다.
- Guideline/Content 단계는 `Promise.allSettled`를 사용해 부분 실패를 허용하며, 스키마 검증 실패 시 섹션별 fallback을 사용합니다.
- 요청별 로그 컨텍스트를 사용해 동시 요청에서도 로그 충돌을 방지합니다.

## Safety Guardrails

- `/api/brand-guideline/generate`에서 입력 텍스트를 검사하고 프롬프트 인젝션 패턴을 경고 로그로 기록합니다.
- 위험 패턴이 감지되어도 기본 동작은 차단 없이 진행하며, 필요 시 차단 로직을 활성화할 수 있습니다.

## Chat 브랜드 분석 모드

- `/api/chat`은 이미지가 포함된 요청에서 Vision + Analysis를 병렬 실행합니다.
- Analysis 응답은 `summary` + `data` JSON을 기대하며, JSON 파싱 실패 시 원문을 요약으로 사용합니다.
- 최종 응답에는 `generate-guidelines` 액션이 포함되어 후속 가이드라인 생성으로 이어집니다.

## 에러 처리

워크플로우 실행 중 에러 발생 시:

```typescript
try {
  // ... 워크플로우 실행
} catch (error) {
  yield {
    type: "error",
    error: error instanceof Error ? error.message : "Unknown error"
  };
}
```

클라이언트는 `type: "error"` 이벤트를 받아 적절한 에러 처리를 수행해야 합니다.
