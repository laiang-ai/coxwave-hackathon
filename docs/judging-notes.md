# 심사 대비 정리 (coxwave-hackathon)

이 문서는 심사 항목에 맞춰 현재 코드베이스에서 강조할 포인트와 보완할 작업을 정리한 내부 참고용 노트입니다.

## 0. 제품 한 줄 요약
- 로고/브랜드 입력을 받아 멀티에이전트가 **브랜드 아이덴티티 + 가이드라인 + 적용 시나리오**를 자동 생성하고, 웹에서 편집/확장까지 가능한 B2B 브랜드 운영 도구.

## 1. 필수 요건 체크

### 1) OpenAI API / SDK 사용
- **근거**
  - `package.json`에 `@openai/agents` 의존성.
  - 워크플로우 실행에서 `run()` 사용: `lib/brand-guideline/orchestrator/workflow.ts`.
  - 채팅 라우트에서 `run()` 사용: `app/api/chat/route.ts`.
  - 이미지 목업 생성에서 `OpenAI` 이미지 API 사용: `app/api/brand-mockups/route.ts`.
- **모델 사용 현황**
  - 대부분 에이전트: `gpt-5.2` (예: `lib/agents/agents/analysis/config.ts`).
  - 편집 전용 에이전트: `gpt-4o` (`lib/agents/agents/brand-editor/config.ts`).
  - 이미지 생성: `gpt-image-1.5` (`app/api/brand-mockups/route.ts`).

### 2) 실행 가능한 데모 (README 명시 필요)
- **현재 상태**
  - `README.md`는 Next.js 기본 템플릿 상태.
  - 데모 링크/영상/스크린샷 없음.
- **보완 필요**
  - README에 **라이브 데모 URL 또는 데모 영상 링크** 명시.
  - 재현 가능한 데모 플로우(로고 업로드 → 분석 → 가이드라인 생성 → 편집/목업) 안내 추가.

## 2. 중점 평가 요소 매핑

### 2.1 멀티에이전트 협업 구조
- **현재 구현**
  - 워크플로우 기반 멀티에이전트 파이프라인: `lib/brand-guideline/orchestrator/workflow.ts`.
  - 분석 단계(vision + analysis)와 가이드라인 단계(logo/color/typography/tone/visual/design-standards) 병렬 실행.
  - 채팅 모드에서 라우터 기반 에이전트 선택: `lib/agents/router.ts`, `app/api/chat/route.ts`.
  - 채팅 에이전트 handoff 구조: `lib/agents/graph.ts`.
- **증빙 문서**
  - 실행 흐름 다이어그램: `docs/agent-execution-flow.md`.
  - 전체 워크플로우 정의: `docs/brand-guideline-workflow.md`.
- **보완 포인트**
  - 멀티에이전트 협업 가치(왜 분리했는지, 병렬화로 어떤 이점이 있는지)를 README에서 명시.

### 2.2 기업용(B2B/사내용) 시나리오
- **핵심 Pain Point**
  - 브랜드 가이드라인은 보통 **디자인/마케팅/제품팀 간 반복 커뮤니케이션 비용**과 **일관성 붕괴**가 큼.
  - 빠른 브랜드 론칭/리브랜딩에서 가이드라인 제작이 병목.
- **현재 구현이 주는 가치**
  - 입력 → 분석 → 가이드라인 → 적용 사례까지 **전 과정 자동화**.
  - 웹 뷰어 + 편집 도구로 **조직 내 공유/수정 흐름** 지원.
  - 목업 생성으로 **실무 적용 예시 시각화** 제공.
- **관련 코드**
  - 가이드라인 생성 API: `app/api/brand-guideline/generate/route.ts`.
  - 브랜드 가이드라인 뷰어: `app/brand/BrandGuideClient.tsx`.
  - 목업 스튜디오: `app/brand/mockups/page.tsx`, `app/api/brand-mockups/route.ts`.
- **보완 포인트**
  - README에서 **B2B 도입 효과(시간/비용 절감, 합의 속도 증가)**를 수치/사례 형태로 설명.

### 2.3 기술 구현

#### (a) 멀티에이전트 안정성
- **현재 구현**
  - 재시도(`withRetry`)와 스키마 검증 실패 재시도: `lib/brand-guideline/orchestrator/workflow.ts`.
  - `Promise.allSettled`로 부분 실패 허용 후 fallback 처리.
  - SSE 스트리밍으로 진행 상황을 이벤트로 제공.
- **보완 포인트**
  - 실패 사례/복구 시나리오(예: 일부 섹션만 실패) 설명을 README에 요약.

#### (b) 도구 사용(Function Calling) + 스키마 검증
- **현재 구현**
  - `tool()` + `zod` 스키마로 도구 정의: `lib/agents/agents/brand-editor/tools.ts`.
  - 워크플로우 출력 JSON 추출 + Zod 검증: `lib/brand-guideline/orchestrator/workflow.ts`.
  - 채팅 스트림에서 tool call 결과 수집/중복 제거: `app/api/chat/route.ts`.
- **보완 포인트**
  - 심사 문서에 “스키마 검증 + 예외 처리 설계”를 한 문단으로 명시.

#### (c) 최적화 & RAG (선택)
- **현재 구현**
  - 병렬 실행으로 지연 최소화.
  - 생성된 데이터는 워크플로우 내에서 구조화.
- **부족/추가 여지**
  - 외부 지식 기반 RAG, 출처 표기 없음.
  - 필요 시 “브랜드 레퍼런스/시장 데이터”를 RAG로 연결하고 결과에 출처 포함.

## 3. 완성도 (Reliability / Pragmatism)
- **안정성**
  - 입력 스키마 검증: `UserInputSchema`, `LogoAssetSchema` (`lib/brand-guideline/schemas`).
  - 에러 이벤트 처리: `runBrandWorkflow` + SSE 스트림.
- **실용주의**
  - 단계 병렬화 + streaming으로 응답 체감 지연 감소.
  - Content 생성(Phase 5)을 별도 실행하여 비용 분리.
- **보완 포인트**
  - 비용/지연(대략적) 수치 공유 시 가점 가능.

## 4. 문서화 (Documentation)
- **존재하는 문서**
  - `docs/agent-execution-flow.md`
  - `docs/brand-guideline-workflow.md`
- **보완 필요**
  - README에 핵심 아키텍처 요약, 데모 링크, 실행 방법 추가.

## 5. 가산점 요소

### Safety
- **현재 구현**
  - 입력 위험 패턴 탐지: `lib/agents/safety.ts`.
  - `/api/brand-guideline/generate`에서 경고 로깅: `app/api/brand-guideline/generate/route.ts`.
- **보완 포인트**
  - 경고 발생 시 실제 차단 로직 옵션 제공 (설정 플래그 등).
  - 에이전트 시스템 프롬프트에 안전 가이드라인 적용 여부 명시.

### Advanced UX
- **현재 구현**
  - 이미지 업로드 기반 브랜드 분석 + CTA: `app/page.tsx`, `app/api/chat/route.ts`.
  - 가이드라인 뷰어 + 프로퍼티 인스펙터 + 채팅 편집: `app/brand` 하위 컴포넌트.
  - Mockup Studio에서 장면별 목업 생성: `app/brand/mockups/page.tsx`.
- **보완 포인트**
  - 데모 영상에서 “Human-in-the-loop 편집 흐름” 강조.

### Observability
- **현재 구현**
  - 워크플로우 로그 컨텍스트/타이밍/에러 로깅: `lib/brand-guideline/orchestrator/logger.ts`.
  - SSE 이벤트 스트리밍으로 단계별 진행 가시화.
- **보완 포인트**
  - 요청 ID를 클라이언트에 노출하거나 로그 상관관계 표기 강화.

## 6. 권장 데모 시나리오 (README에 넣을 요약)
1. 홈에서 로고 이미지 업로드 + 브랜드 설명 입력.
2. 브랜드 분석 결과(vision/analysis) 확인.
3. “전체 가이드라인 생성” 실행 → `/brand`로 이동.
4. 가이드라인 섹션(logo/color/typography/tone/visual) 확인.
5. 채팅 편집으로 색상/문구 수정 → 즉시 반영.
6. Mockup Studio에서 장면 선택 후 이미지 생성.

## 7. 우선순위 TODO
1. README에 데모 링크/영상 + 실행 방법 + 핵심 가치 요약 추가.
2. README에 “멀티에이전트 협업 구조” 다이어그램/요약 반영.
3. B2B 도입 효과(ROI/시간 절감) 문장화.
4. RAG/출처 표기 계획 또는 “현재는 입력 기반 생성” 명시.
5. 안전성 차단 옵션 및 정책 설명 보완.
