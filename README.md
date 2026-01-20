https://github.com/user-attachments/assets/b50bfc62-d783-48ed-ae71-25ed60913b47
# 라이앙 (Brandkit)

> 로고 한 장과 간단한 입력만으로 브랜드 가이드라인을 생성하고, 에디터와 목업으로 확장하는 멀티에이전트 브랜드 워크플로우.

## 한 줄 요약

브랜드팀이 초기 아이덴티티를 빠르게 정리하고 팀 전체에 일관된 디자인 기준을 배포할 수 있도록, 멀티에이전트가 브랜드 가이드라인과 적용 목업을 자동 생성합니다.

## 데모 (실행 가능한 데모)

- 로컬 데모: `http://localhost:3000`
- 데모 영상/이미지
  - 브랜드 가이드라인 생성 플로우:

https://github.com/user-attachments/assets/b50bfc62-d783-48ed-ae71-25ed60913b47

  - 목업 생성 1

https://github.com/user-attachments/assets/245156b1-6fbe-4660-b3e8-2454330ee40e

  - 목업 생성 2:

https://github.com/user-attachments/assets/65a23a86-6448-4829-95b0-a2a4ac555308

  - 목업 생성 3

https://github.com/user-attachments/assets/566a4f81-d50b-4b3c-95b9-874668f962f1


<img width="1536" height="1024" alt="ProtoPie-mockup-1" src="https://github.com/user-attachments/assets/9c224cba-e933-41f8-b630-17156837f626" />
<img width="1536" height="1024" alt="ProtoPie-mockup-2" src="https://github.com/user-attachments/assets/9b9adc50-ce85-49da-9f4c-24b554bc96df" />
<img width="1536" height="1024" alt="ProtoPie-mockup-3" src="https://github.com/user-attachments/assets/01bca6b3-27fa-4b3c-95b9-874668f962f1" />

## 문제 정의 (B2B / 사내 시나리오)

- 신규 브랜드 런칭 시 아이덴티티와 가이드라인을 정리하는 데 시간이 많이 소요됨
- 마케팅/디자인/프로덕트 팀 간 기준이 달라 작업물의 일관성이 떨어짐
- 외주/에이전시와의 협업에서 가이드라인 공유 및 수정 비용이 반복적으로 발생

## 솔루션

로고와 핵심 정보 입력 -> 멀티 에이전트 분석/합성 -> 가이드라인 생성 ->
브랜드 에디터에서 수정 -> Mockup Studio로 적용 예시 생성까지 한 흐름으로 제공합니다.

## 멀티에이전트 협업 구조

- Vision + Analysis 에이전트가 로고와 입력 정보를 병렬 분석
- Identity 에이전트가 핵심 톤/키워드를 정리
- Guidelines 에이전트가 로고/색상/타이포/톤/비주얼/디자인 스탠다드로 세분화 생성
- 결과를 BrandType으로 구조화해 에디터와 목업 생성에 재사용

## 심사 조건 충족 여부

- [x] OpenAI API 사용 (핵심 생성 및 분석 로직에 활용)
- [x] 멀티에이전트 구현 (분석/합성/가이드라인 분업)
- [x] 실행 가능한 데모 (로컬 실행 + 영상/이미지)

## 심사 기준 대응 포인트

- 아이디어 (시장성/ROI)
  - 초기 가이드라인 정리에 드는 리드타임과 커뮤니케이션 비용 절감
  - 룰베이스로 구현하기 어려운 브랜드 톤/비주얼 정합성 문제를 생성형 AI로 해결
- 기술 구현
  - 에이전트 분업으로 결과물 품질과 속도 균형
  - Function Calling 스키마 기반 결과 구조화로 후속 편집과 재사용 용이
- 완성도
  - 에디터/목업으로 즉시 실무 적용 가능한 산출물 제공
  - 결과 구조를 표준화해 후속 작업과 확장에 유리
- 문서화
  - 실행 방법, 데모 링크, 아키텍처 설명 제공

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

## 데모 시나리오 (5분)

1. 로고 이미지와 브랜드 기본 정보를 입력합니다.
2. 가이드라인 생성 버튼을 실행합니다.
3. 생성된 가이드라인을 에디터에서 검토/수정합니다.
4. Mockup Studio에서 결과 적용 이미지를 생성합니다.

## 향후 계획 (Optional)

- Brand Editor의 Import/Export 고도화
- 브랜드 섹션(Visual/Design Standards 등) UI 확장

## 팀원

| 이름 | 역할 |
| ---- | ---- |
| 김재덕 | 개발 |
| 홍유진 | 개발 |
| 이재상 | 개발 |
