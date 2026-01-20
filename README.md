# 팀명

Brandkit

> 로고 한 장과 간단한 입력만으로 브랜드 가이드라인을 생성하고, 에디터와 목업으로 확장하는 멀티에이전트 브랜드 워크플로우.

## 데모

- 로컬 데모: `http://localhost:3000`

## 문제 정의

브랜드 초기 단계에서 아이덴티티와 가이드라인을 빠르게 정리하기 어렵고,
팀 내 일관된 디자인 기준을 공유하기까지 시간이 오래 걸립니다.

## 솔루션

로고와 핵심 정보 입력 → 멀티 에이전트 분석/합성 → 가이드라인 생성 →
브랜드 에디터에서 수정 → Mockup Studio로 적용 예시 생성까지 한 흐름으로 제공합니다.

## 조건 충족 여부

- [x] OpenAI API 사용
- [x] 멀티에이전트 구현
- [x] 실행 가능한 데모

## 아키텍처

```
User Input (logo + brand info)
  -> /api/brand-guideline/generate (SSE)
    -> runBrandWorkflow()
       Phase 2: Vision + Analysis (parallel)
       Phase 3: Identity (sequential)
       Phase 4: Guidelines (logo/color/typography/tone/visual/design-standards)
    -> BrandType 생성
  -> /brand (editor)
  -> /brand/mockups (Mockup Studio, /api/brand-mockups)
```

## 기술 스택

- Next.js 16 (App Router) + React 19
- TypeScript
- @openai/agents + OpenAI API
- Tailwind CSS, Biome

## 설치 및 실행

```bash
# 환경 설정
cp .env.example .env
# OPENAI_API_KEY=... 입력

# 의존성 설치
pnpm install

# 실행
pnpm dev
```

## 향후 계획 (Optional)

- Brand Editor의 Import/Export 고도화
- 브랜드 섹션(Visual/Design Standards 등) UI 확장

## 팀원

| 이름 | 역할 |
| ---- | ---- |
|      |      |
|      |      |
