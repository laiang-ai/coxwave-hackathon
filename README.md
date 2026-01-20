
https://github.com/user-attachments/assets/b50bfc62-d783-48ed-ae71-25ed60913b47
# 라이앙

## Brandkit

> 로고 한 장과 간단한 입력만으로 브랜드 가이드라인을 생성하고, 에디터와 목업으로 확장하는 멀티에이전트 브랜드 워크플로우.

## 데모

- 로컬 데모: `http://localhost:3000`

- 목업 생성

https://github.com/user-attachments/assets/245156b1-6fbe-4660-b3e8-2454330ee40e


  
<img width="1536" height="1024" alt="ProtoPie-mockup-1" src="https://github.com/user-attachments/assets/9c224cba-e933-41f8-b630-17156837f626" />
<img width="1536" height="1024" alt="ProtoPie-mockup-2" src="https://github.com/user-attachments/assets/9b9adc50-ce85-49da-9f4c-24b554bc96df" />
<img width="1536" height="1024" alt="ProtoPie-mockup-3" src="https://github.com/user-attachments/assets/01bca6b3-27fa-4a58-bcdc-3e765bd7a4d4" />

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
| 김재덕 | 개발 |
| 홍유진 | 개발 |
| 이재상 | 개발 |
