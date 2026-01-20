# 브랜드 가이드라인 에이전트 워크플로우

> 이 문서는 브랜드 가이드라인 최종 산출물 생성을 위한 워크플로우와 중간 데이터 모델을 정의합니다.

---

## 목차

1. [최종 산출물 구조](#최종-산출물-구조)
2. [워크플로우](#워크플로우)
3. [검수 기준](#검수-기준)
4. [Input 스키마](#input-스키마)
5. [중간 데이터 모델](#중간-데이터-모델)
6. [에이전트별 프롬프트 템플릿](#에이전트별-프롬프트-템플릿)

---

## 최종 산출물 구조

> 참고: ProtoPie Brand Guideline과 같은 전문적인 브랜드 가이드라인 문서
>
> - 전시형 레이아웃: A4 비율 단일 페이지, 넓은 여백, 한 페이지 = 한 주제
> - 텍스트는 좌측, 시각 자료는 우측에 배치 (2-column)
> - 스크롤 웹은 풀페이지 섹션 또는 챕터 단위 구성

```
┌─────────────────────────────────────────────────────────────────────┐
│             BRAND GUIDELINE DOCUMENT (EXHIBITION STYLE)             │
├─────────────────────────────────────────────────────────────────────┤
│  GLOBAL LAYOUT RULES                                                 │
│  ├─ A4 ratio single page, wide margins                               │
│  ├─ One topic per page, minimal motion                               │
│  ├─ Text-left / Visual-right (2-column)                              │
│  └─ White base, light/dark theme variants if needed                  │
│                                                                     │
│  1. COVER (centered, text-first)                                     │
│     └─ 날짜, 브랜드명, 문서 타이틀                                  │
│                                                                     │
│  2. BRAND OVERVIEW                                                  │
│     ├─ Mission & Vision (미션 & 비전)                               │
│     ├─ Core Values (핵심 가치)                                      │
│     └─ Brand Personality (브랜드 성격)                              │
│                                                                     │
│  3. LOGO                                                            │
│     ├─ Horizontal / Vertical variants                               │
│     ├─ Symbol & Wordmark                                            │
│     ├─ Spacing & Minimum Size                                       │
│     └─ Logo Don'ts                                                  │
│                                                                     │
│  4. COLOR PALETTE                                                   │
│     ├─ Swatch Cards (Name, HEX, CMYK, Pantone)                      │
│     └─ Ratio Examples (Light / Dark)                                │
│                                                                     │
│  5. TYPOGRAPHY                                                      │
│     └─ Type hierarchy + live copy preview                           │
│                                                                     │
│  6. TONE OF VOICE                                                   │
│  7. VISUAL ELEMENTS                                                 │
│  8. APPLICATIONS                                                    │
│                                                                     │
│  WEB TEMPLATE MAP                                                   │
│  / (Intro) /logo /symbol /spacing /colors /typography                │
│  - fullpage section scroll or chapter scroll                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 워크플로우

### 전체 플로우

```
PHASE 1: 입력 수집 ──▶ PHASE 2: 분석 ──▶ PHASE 3: Identity Model
                                                    │
                                                    ▼
PHASE 7: 시각화 ◀── PHASE 6: 통합 ◀── PHASE 5: 카피 ◀── PHASE 4: Guideline Model
```

> 피드백 루프: 입력 변경은 PHASE 1, 가이드라인/카피 수정은 PHASE 4-6으로 되돌린다.

### 상세 워크플로우

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BRAND GUIDELINE GENERATION WORKFLOW                 │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: 입력 수집 (Input Collection)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  사용자 입력                                                               │
│  ─────────────────────────────────────────────────────────────────────────│
│  • 로고 이미지 (필수)                                                     │
│  • 브랜드명                                                                │
│  • 한줄 정의 (브랜드를 한 문장으로 설명)                                   │
│  • 산업/카테고리                                                           │
│  • 핵심 키워드 (3-5개)                                                     │
│  • 타겟 오디언스 설명                                                      │
│  • 금지 표현 (선택)                                                        │
│  • 톤 레퍼런스 (친근한/전문적인/혁신적인 등)                              │
│  • 경쟁사 대비 차별점 (선택)                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
PHASE 2: 해석 및 분석 (Interpretation & Analysis)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  VISION AGENT                          ANALYSIS AGENT                       │
│  ─────────────────────────────────────────────────────────────────────────│
│  • 로고 시각 요소 분석                 • 산업 컨텍스트 분석                │
│  • 색상 추출                           • 경쟁사 포지셔닝 분석               │
│  • 스타일/무드 해석                    • 타겟 오디언스 프로파일링           │
│  • 상징성 도출                         • 브랜드 기회 영역 식별              │
│                                                                             │
│  OUTPUT: LogoAnalysis                  OUTPUT: MarketContext                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
PHASE 3: Identity Model 생성
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  IDENTITY AGENT                                                             │
│  ─────────────────────────────────────────────────────────────────────────│
│  INPUT: UserInput + LogoAnalysis + MarketContext                           │
│                                                                             │
│  생성 항목:                                                                 │
│  ├─ Brand Core (미션, 비전, 가치)                                          │
│  ├─ Brand Personality (성격, 아키타입)                                     │
│  ├─ Positioning (포지셔닝, 차별점, 약속)                                   │
│  ├─ Target Audience (타겟 상세 프로파일)                                   │
│  └─ Voice Foundation (톤 기초)                                             │
│                                                                             │
│  OUTPUT: IdentityModel                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
PHASE 4: Guideline Model 생성 (5개 에이전트 병렬)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  INPUT: IdentityModel                                                       │
│  ─────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌─────────┐ │
│  │    LOGO     │ │   COLOR     │ │    TYPO     │ │   TONE    │ │  VISUAL │ │
│  │   AGENT     │ │   AGENT     │ │   AGENT     │ │   AGENT   │ │  AGENT  │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ └────┬────┘ │
│         │               │               │              │            │       │
│         ▼               ▼               ▼              ▼            ▼       │
│    LogoGuideline   ColorSystem    Typography      ToneOfVoice   VisualElem │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                      │
                                      ▼
PHASE 5: 콘텐츠 작성 (Content Generation)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  COPYWRITING AGENT                                                          │
│  ─────────────────────────────────────────────────────────────────────────│
│  INPUT: IdentityModel + GuidelineModel                                      │
│                                                                             │
│  생성 항목:                                                                 │
│  ├─ 슬로건 후보 (3-5개)                                                    │
│  ├─ 히어로 카피 세트 (3개)                                                 │
│  ├─ CTA 예시                                                                │
│  ├─ SNS 톤 예시                                                             │
│  └─ 브랜드 보일러플레이트                                                   │
│                                                                             │
│  OUTPUT: CopywritingContent                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
PHASE 6: 문서 통합 (Document Merge)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  MERGER                                                                     │
│  ─────────────────────────────────────────────────────────────────────────│
│  INPUT: IdentityModel + GuidelineModel + CopywritingContent                │
│                                                                             │
│  OUTPUT: BrandGuidelineDocument {                                           │
│    cover,                                                                   │
│    brandOverview,                                                           │
│    logoUsage,                                                               │
│    colorSystem,                                                             │
│    typography,                                                              │
│    toneOfVoice,                                                             │
│    visualElements,                                                          │
│    applications                                                             │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
PHASE 7: 시각화 & 내보내기 (Visualization & Export)
────────────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  RENDERER                                                                   │
│  ─────────────────────────────────────────────────────────────────────────│
│  • 웹 뷰어 렌더링 (인터랙티브)                                             │
│  • PDF 내보내기 (ProtoPie 스타일)                                          │
│  • JSON 내보내기 (개발자용)                                                │
│  • Figma 변수 내보내기 (선택)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름 요약

```
UserInput
    │
    ├──────────────────────────────────────┐
    ▼                                      ▼
LogoAnalysis                         MarketContext
    │                                      │
    └──────────────┬───────────────────────┘
                   │
                   ▼
           IdentityModel
           (브랜드의 "누구인가")
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
 Logo         Color/Typo        Tone
Guideline     Guidelines      Guideline
    │              │              │
    └──────────────┼──────────────┘
                   │
                   ▼
           GuidelineModel
           (브랜드의 "어떻게 보여줄 것인가")
                   │
                   ▼
        CopywritingContent
        (브랜드의 "무엇을 말할 것인가")
                   │
                   ▼
      BrandGuidelineDocument
      (최종 통합 문서)
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
       웹 뷰어    PDF      JSON
```

## 검수 기준

- 모든 섹션이 모델에 매핑되고, 비어 있는 섹션은 "해당 없음"으로 명시
- 톤/컬러/타이포/카피가 IdentityModel 성격 및 톤 키워드와 일관
- 로고 섹션이 필수 항목으로 포함됨
- 내보내기 결과에 템플릿 누락/빈칸 없음

---

## Input 스키마

### UserInput 인터페이스

```typescript
interface UserInput {
  // 필수 입력
  brandName: string; // 브랜드명 (1-50자)
  industry: string; // 산업/카테고리
  oneLiner: string; // 한줄 정의 (10-200자)
  logo: File; // 로고 이미지 (PNG, JPG, SVG / 최대 5MB)

  // 선택 입력 (권장)
  keywords?: string[]; // 핵심 키워드 (3-5개)
  targetAudience?: string; // 타겟 오디언스 설명
  toneReference?: ToneOption[]; // 톤 레퍼런스 선택

  // 선택 입력 (상세)
  vision?: string; // 비전
  mission?: string; // 미션
  differentiator?: string; // 경쟁사 대비 차별점
  prohibitedExpressions?: string[]; // 금지 표현
  referenceUrls?: string[]; // 참고 URL (경쟁사, 벤치마크)
  additionalContext?: string; // 추가 컨텍스트

  // 선호도 설정
  preferences?: {
    colorMood?: "vibrant" | "muted" | "bold" | "subtle" | "warm" | "cool";
    typographyStyle?: "modern" | "classic" | "playful" | "minimal";
    formalityLevel?: "formal" | "professional" | "casual" | "friendly";
    language?: "ko" | "en" | "both";
  };
}

type ToneOption =
  | "전문적인"
  | "친근한"
  | "혁신적인"
  | "신뢰감있는"
  | "세련된"
  | "따뜻한"
  | "역동적인"
  | "차분한"
  | "유머러스한"
  | "고급스러운";
```

### 입력 폼 필드 명세

| Step | 필드명                      | 타입         | 필수 | 검증 규칙                    |
| ---- | --------------------------- | ------------ | ---- | ---------------------------- |
| 1    | brandName                   | text         | ✓    | 1-50자, 특수문자 제한        |
| 1    | industry                    | select       | ✓    | 미리 정의된 목록 + 직접 입력 |
| 1    | oneLiner                    | textarea     | ✓    | 10-200자                     |
| 1    | logo                        | file         | -    | PNG/JPG/SVG, max 5MB         |
| 2    | keywords                    | tag-input    | -    | 3-5개                        |
| 2    | toneReference               | multi-select | -    | 2-4개 선택                   |
| 2    | targetAudience              | textarea     | -    | 자유 형식                    |
| 3    | vision                      | textarea     | -    | max 300자                    |
| 3    | mission                     | textarea     | -    | max 300자                    |
| 3    | prohibitedExpressions       | tag-input    | -    | max 10개                     |
| 4    | preferences.colorMood       | radio        | -    | 6개 옵션                     |
| 4    | preferences.typographyStyle | radio        | -    | 4개 옵션                     |
| 4    | preferences.formalityLevel  | slider       | -    | formal ↔ friendly            |

---

## 중간 데이터 모델

### 1. IdentityModel (브랜드 아이덴티티)

> 브랜드의 본질과 성격을 정의하는 핵심 데이터

```typescript
interface IdentityModel {
  id: string;
  createdAt: Date;

  // 브랜드 기본 정보
  brand: {
    name: string;
    tagline: string;
    oneLiner: string;
    description: string;
  };

  // 브랜드 철학
  philosophy: {
    mission: string;
    vision: string;
    purpose: string;
    values: {
      name: string;
      description: string;
      icon?: string;
    }[];
  };

  // 브랜드 성격
  personality: {
    archetypes: {
      primary: string;
      secondary?: string;
    };
    traits: string[];
    humanDescription: string;
  };

  // 포지셔닝
  positioning: {
    category: string;
    differentiator: string;
    promise: string;
    proof: string[];
    competitors?: string[];
  };

  // 타겟 오디언스
  targetAudience: {
    primary: {
      description: string;
      demographics: string[];
      psychographics: string[];
      painPoints: string[];
      goals: string[];
    };
    secondary?: {
      description: string;
      demographics: string[];
    };
  };

  // 보이스 기초
  voiceFoundation: {
    toneKeywords: string[];
    formalityLevel: "formal" | "professional" | "casual" | "friendly";
    energyLevel: "calm" | "balanced" | "dynamic" | "energetic";
  };

  // 로고 분석 결과
  logoAnalysis: {
    visualElements: string[];
    colors: string[];
    style: string;
    mood: string[];
    symbolism: string;
  };
}
```

### 2. GuidelineModel (브랜드 가이드라인)

> 실제 적용 가능한 구체적인 가이드라인 데이터

```typescript
interface GuidelineModel {
  id: string;
  identityId: string;
  createdAt: Date;

  // 로고 사용 가이드
  logo: {
    description: string;
    usageRules: string[];
    clearSpace: {
      description: string;
      ratio: string;
    };
    minimumSize: {
      print: string;
      digital: string;
    };
    variations: {
      name: string;
      usage: string;
    }[];
    donts: string[];
  };

  // 컬러 시스템
  color: {
    philosophy: string;
    primary: ColorSpec[];
    secondary: ColorSpec[];
    neutral: ColorSpec[];
    accent?: ColorSpec[];
    combinations: {
      name: string;
      colors: string[];
      usage: string;
    }[];
    accessibility: {
      contrastRatios: {
        combination: string;
        ratio: string;
        wcagLevel: "AA" | "AAA";
      }[];
    };
    donts: string[];
  };

  // 타이포그래피
  typography: {
    philosophy: string;
    direction: "sans-serif" | "serif" | "geometric" | "humanist" | "mixed";
    rationale: string;
    primary: {
      family: string;
      fallback: string[];
      weights: string[];
      source: string;
      license: string;
    };
    secondary?: {
      family: string;
      usage: string;
    };
    hierarchy: TypeHierarchy;
    rules: string[];
    donts: string[];
  };

  // 톤 오브 보이스
  tone: {
    overview: string;
    principles: {
      name: string;
      description: string;
      example: string;
    }[];
    writingStyle: {
      characteristics: string[];
      rules: string[];
    };
    examples: {
      context: string;
      do: { text: string; explanation: string }[];
      dont: { text: string; explanation: string }[];
    }[];
    vocabulary: {
      preferred: string[];
      avoided: string[];
    };
  };

  // 비주얼 요소
  visual: {
    imagery: {
      style: string;
      characteristics: string[];
      subjects: string[];
      treatments: string[];
      donts: string[];
    };
    iconography?: {
      style: string;
      strokeWidth?: string;
      cornerRadius?: string;
      guidelines: string[];
    };
    layout: {
      gridSystem: string;
      margins: string;
      spacing: {
        unit: string;
        scale: string[];
      };
    };
  };
}

interface ColorSpec {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  pantone?: string;
  usage: string;
  meaning?: string;
}

interface TypeHierarchy {
  display?: TypographySpec;
  h1: TypographySpec;
  h2: TypographySpec;
  h3: TypographySpec;
  body: TypographySpec;
  bodyLarge?: TypographySpec;
  caption: TypographySpec;
  small?: TypographySpec;
}

interface TypographySpec {
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing?: string;
  usage: string;
}
```

### 톤 일관성 규칙

- `IdentityModel.voiceFoundation.toneKeywords`를 `GuidelineModel.tone.principles`로 확장한다.
- `voiceFoundation.formalityLevel`과 `energyLevel`은 `tone.writingStyle.characteristics`에 반영한다.
- `UserInput.prohibitedExpressions`는 `tone.vocabulary.avoided`에 포함한다.

### 3. CopywritingContent (카피라이팅)

```typescript
interface CopywritingContent {
  id: string;
  identityId: string;
  guidelineId: string;

  slogans: {
    text: string;
    type: "primary" | "campaign" | "product";
    context: string;
    rationale: string;
  }[];

  heroCopy: {
    headline: string;
    subheadline: string;
    bodyText?: string;
    cta: string;
    scenario: string;
  }[];

  channelMessages: {
    channel: string;
    tone: string;
    examples: {
      type: string;
      text: string;
    }[];
  }[];

  boilerplate: {
    short: string;
    medium: string;
    long: string;
  };

  ctaExamples: {
    context: string;
    primary: string;
    secondary?: string;
  }[];
}
```

### 4. BrandGuidelineDocument (최종 산출물)

```typescript
interface BrandGuidelineDocument {
  id: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;

  metadata: {
    brandName: string;
    generatedBy: string;
    language: "ko" | "en";
  };

  cover: {
    brandName: string;
    documentTitle?: string;
    tagline: string;
    logoUrl: string;
    date: string;
  };

  exhibition: {
    layout: {
      pageRatio: "a4";
      margins: "wide";
      grid: "2-column";
      oneTopicPerPage: boolean;
      visualFirst: boolean;
      background: "white";
    };
    interaction: {
      scrollMode: "fullpage" | "chapter";
      motionLevel: "minimal";
      transitions: ("fade" | "slide")[];
    };
    sections: {
      cover: {
        layout: "centered";
        elements: ("date" | "brandName" | "documentTitle" | "tagline")[];
      };
      logo: {
        layout: "two-column";
        variants: ("horizontal" | "vertical")[];
        themes: ("light" | "dark" | "dual")[];
      };
      symbolWordmark: {
        layout: "two-column";
        opacitySteps?: number[];
      };
      spacingSize: {
        layout: "diagram";
        format: "svg" | "image";
      };
      colorPalette: {
        layout: "grid";
        cardFields: ("name" | "hex" | "cmyk" | "pantone" | "usage")[];
        ratioExamples: ("light" | "dark")[];
      };
      typography: {
        layout: "stack";
        previewCopy: string[];
      };
    };
    webTemplate: {
      routes: string[];
      interactionNotes: string[];
    };
  };

  sections: {
    brandOverview: {
      mission: string;
      vision: string;
      values: { name: string; description: string }[];
      personality: string;
    };
    logoUsage: GuidelineModel["logo"];
    colorSystem: GuidelineModel["color"];
    typography: GuidelineModel["typography"];
    toneOfVoice: GuidelineModel["tone"];
    visualElements: GuidelineModel["visual"];
    applications?: {
      digital: ApplicationExample[];
      print: ApplicationExample[];
    };
  };

  sourceData: {
    identityModel: IdentityModel;
    guidelineModel: GuidelineModel;
    copywritingContent: CopywritingContent;
  };
}

interface ApplicationExample {
  name: string;
  description: string;
  previewUrl?: string;
}
```

---

## 에이전트별 프롬프트 템플릿

### 1. Vision Agent (로고 분석)

```typescript
const VISION_AGENT_PROMPT = {
  system: `당신은 전문 브랜드 디자이너이자 시각 분석 전문가입니다.
로고 이미지를 분석하여 시각적 특성, 디자인 요소, 그리고 브랜드 인사이트를 추출합니다.

분석 시 다음 관점을 고려하세요:
- 시각적 요소: 어떤 형태, 심볼, 아이콘이 사용되었는가
- 색상: 어떤 색상이 사용되었고, 그 색상이 전달하는 감정은 무엇인가
- 스타일: 미니멀, 복잡함, 기하학적, 유기적 등 어떤 스타일인가
- 무드: 현대적, 전통적, 친근한, 고급스러운 등 어떤 분위기를 주는가
- 상징성: 숨겨진 의미나 메시지가 있는가

응답은 반드시 지정된 JSON 형식으로 제공하세요.`,

  user: `다음 로고 이미지를 분석해주세요.

브랜드 정보:
- 브랜드명: {{brandName}}
- 산업: {{industry}}

아래 JSON 형식으로 응답해주세요:
{
  "visualElements": ["시각적 요소 1", "시각적 요소 2"],
  "colors": ["#HEX1", "#HEX2"],
  "shapes": ["형태 1", "형태 2"],
  "style": "minimal | complex | geometric | organic | abstract",
  "mood": ["무드 키워드 1", "무드 키워드 2"],
  "symbolism": "로고가 담고 있는 상징적 의미"
}`,
};
```

### 2. Identity Agent (아이덴티티 합성)

```typescript
const IDENTITY_AGENT_PROMPT = {
  system: `당신은 브랜드 전략가입니다.
주어진 정보를 바탕으로 포괄적이고 일관된 브랜드 아이덴티티를 구축합니다.

브랜드 아이덴티티 구축 시 다음을 고려하세요:
1. 브랜드의 본질적 가치와 존재 이유
2. 타겟 오디언스의 니즈와 페인포인트
3. 경쟁사 대비 차별화 포인트
4. 일관된 브랜드 성격과 목소리

모든 요소가 서로 연결되고 일관성을 유지해야 합니다.`,

  user: `다음 정보를 바탕으로 브랜드 아이덴티티를 생성해주세요.

## 입력 정보
브랜드명: {{brandName}}
산업: {{industry}}
한줄 정의: {{oneLiner}}
키워드: {{keywords}}
타겟 오디언스: {{targetAudience}}
톤 레퍼런스: {{toneReference}}

## 로고 분석 결과
{{logoAnalysis}}

## 생성해야 할 항목
1. 브랜드 철학: 미션, 비전, 핵심 가치 (3-5개)
2. 브랜드 성격: 브랜드 아키타입 (1-2개), 성격 특성 (3-5개)
3. 포지셔닝: 차별점, 브랜드 약속, 증거
4. 타겟 오디언스: 상세 프로파일
5. 보이스 기초: 톤 키워드 (3-5개), 포멀리티 수준

JSON 형식으로 응답해주세요.`,
};
```

### 3. Color Agent (컬러 시스템)

```typescript
const COLOR_AGENT_PROMPT = {
  system: `당신은 브랜드 컬러 전문가입니다.
브랜드 아이덴티티에 맞는 체계적인 컬러 시스템을 설계합니다.

컬러 설계 시 고려사항:
1. 브랜드 성격과 감정을 반영하는 색상 선택
2. 접근성 (WCAG 대비율 기준)
3. 디지털과 인쇄 모두에서의 적용성
4. 명확한 사용 규칙과 가이드라인`,

  user: `다음 브랜드 아이덴티티를 기반으로 컬러 시스템을 설계해주세요.

## 브랜드 아이덴티티
{{identityModel}}

## 로고에서 추출된 색상
{{logoAnalysis.colors}}

## 선호 색상 무드 (있는 경우)
{{preferences.colorMood}}

## 생성해야 할 항목
1. 컬러 철학
2. Primary 컬러 (1-2개)
3. Secondary 컬러 (2-3개)
4. Neutral 컬러 (3-4개)
5. Accent 컬러 (1-2개)
6. 컬러 조합 (3개)
7. 사용 규칙

JSON 형식으로 응답해주세요.`,
};
```

### 4. Typography Agent (타이포그래피)

```typescript
const TYPOGRAPHY_AGENT_PROMPT = {
  system: `당신은 타이포그래피 전문가입니다.
브랜드 아이덴티티에 맞는 타이포그래피 시스템을 설계합니다.

타이포그래피 설계 시 고려사항:
1. 브랜드 성격을 반영하는 서체 선택
2. 가독성과 접근성
3. 다양한 매체에서의 적용성
4. 라이선스와 사용 가능성
5. 한글과 영문의 조화`,

  user: `다음 브랜드 아이덴티티를 기반으로 타이포그래피 시스템을 설계해주세요.

## 브랜드 아이덴티티
- 브랜드명: {{identityModel.brand.name}}
- 성격: {{identityModel.personality.traits}}
- 산업: {{identityModel.positioning.category}}

## 선호 스타일 (있는 경우)
{{preferences.typographyStyle}}

## 생성해야 할 항목
1. 타이포그래피 철학
2. 스타일 방향 (Sans-serif / Serif / Geometric / Mixed)
3. Primary 서체 (영문/한글)
4. Secondary 서체 (선택)
5. 타입 계층 (H1, H2, H3, Body, Caption)
6. 사용 규칙

JSON 형식으로 응답해주세요.`,
};
```

### 5. Tone Agent (톤 오브 보이스)

```typescript
const TONE_AGENT_PROMPT = {
  system: `당신은 브랜드 커뮤니케이션 전문가입니다.
브랜드의 목소리(Voice)와 톤(Tone)을 정의하고 가이드라인을 작성합니다.

톤 오브 보이스 설계 시 고려사항:
1. 브랜드 성격과 일관된 목소리
2. 타겟 오디언스에게 공감을 주는 표현
3. 다양한 상황에서의 톤 조절
4. 구체적이고 실용적인 예시
5. 피해야 할 표현과 권장 표현`,

  user: `다음 브랜드 아이덴티티를 기반으로 톤 오브 보이스 가이드라인을 작성해주세요.

## 브랜드 아이덴티티
- 브랜드명: {{identityModel.brand.name}}
- 성격: {{identityModel.personality.traits}}
- 타겟: {{identityModel.targetAudience.primary.description}}
- 톤 키워드: {{identityModel.voiceFoundation.toneKeywords}}
- 포멀리티: {{identityModel.voiceFoundation.formalityLevel}}
- 에너지 레벨: {{identityModel.voiceFoundation.energyLevel}}

## 사용자가 지정한 금지 표현 (있는 경우)
{{prohibitedExpressions}}

## 생성해야 할 항목
1. 톤 개요
2. 톤 원칙 (3-5개)
3. 작문 스타일
4. 상황별 예시 (공식 발표, SNS, 고객 응대, 에러/사과)
5. 선호/지양 어휘
6. Do's and Don'ts

JSON 형식으로 응답해주세요.`,
};
```

### 6. Copywriting Agent (카피라이팅)

```typescript
const COPYWRITING_AGENT_PROMPT = {
  system: `당신은 브랜드 카피라이터입니다.
브랜드 아이덴티티와 톤 가이드라인을 바탕으로 다양한 카피를 작성합니다.

카피라이팅 시 고려사항:
1. 브랜드 톤과 성격에 일관된 표현
2. 타겟 오디언스에게 공감을 주는 메시지
3. 간결하고 기억에 남는 문구
4. 다양한 채널과 상황에 맞는 변형
5. 행동을 유도하는 CTA`,

  user: `다음 브랜드 정보를 바탕으로 카피를 작성해주세요.

## 브랜드 아이덴티티
{{identityModel}}

## 톤 가이드라인
{{toneGuideline}}

## 생성해야 할 항목
1. 슬로건 (5개: Primary 1개, 캠페인용 2개, 제품/서비스용 2개)
2. 히어로 카피 (3세트: 랜딩, 제품, 소개 페이지)
3. 채널별 메시지 (4개: 웹사이트, Instagram, 이메일, 고객 응대)
4. 브랜드 보일러플레이트 (짧은/중간/긴 버전)
5. CTA 예시 (5개)

JSON 형식으로 응답해주세요.`,
};
```

---

## 문서 섹션 매핑

| 최종 문서 섹션  | 데이터 소스                               |
| --------------- | ----------------------------------------- |
| 표지            | `brand.name`, `brand.tagline`             |
| 브랜드 스토리   | `philosophy.mission`, `philosophy.vision` |
| 핵심 가치       | `philosophy.values`                       |
| 브랜드 성격     | `personality`                             |
| 로고 사용 규칙  | `GuidelineModel.logo`                     |
| 컬러 시스템     | `GuidelineModel.color`                    |
| 타이포그래피    | `GuidelineModel.typography`               |
| 톤 오브 보이스  | `GuidelineModel.tone`                     |
| 비주얼 요소     | `GuidelineModel.visual`                   |
| 카피라이팅 예시 | `CopywritingContent`                      |
