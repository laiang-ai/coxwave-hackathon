import { run } from "@openai/agents";
import { createLogContext, logWorkflowEvent } from "./logger";
import { createAnalysisAgent } from "@/lib/agents/agents/analysis";
import { createApplicationsAgent } from "@/lib/agents/agents/applications";
import { createColorAgent } from "@/lib/agents/agents/color";
import { createCopywritingAgent } from "@/lib/agents/agents/copywriting";
import { createDesignStandardsAgent } from "@/lib/agents/agents/design-standards";
import { createIdentityAgent } from "@/lib/agents/agents/identity";
import { createLogoGuideAgent } from "@/lib/agents/agents/logo-guide";
import { createToneAgent } from "@/lib/agents/agents/tone";
import { createTypographyAgent } from "@/lib/agents/agents/typography";
import { createVisionAgent } from "@/lib/agents/agents/vision";
import { createVisualAgent } from "@/lib/agents/agents/visual";
import type {
	ApplicationsContent,
	CopywritingContent,
	GuidelineModel,
	IdentityModel,
	LogoAnalysis,
	LogoAsset,
	MarketContext,
	UserInput,
} from "../schemas";
import {
	ApplicationsContentSchema,
	CopywritingContentSchema,
	GuidelineModelSchema,
	IdentityModelSchema,
	LogoAnalysisSchema,
	MarketContextSchema,
} from "../schemas";

// UUID helper using crypto.randomUUID()
const generateId = () => crypto.randomUUID();

// ============================================
// Retry & Error Recovery Utilities
// ============================================

/**
 * 지수 백오프를 사용한 재시도 래퍼
 * @param fn 실행할 비동기 함수
 * @param maxRetries 최대 재시도 횟수 (기본값: 2)
 * @param baseDelay 기본 대기 시간 ms (기본값: 1000)
 */
async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 2,
	baseDelay = 1000,
): Promise<T> {
	let lastError: Error | null = null;
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			if (attempt < maxRetries) {
				const delay = baseDelay * Math.pow(2, attempt);
				console.warn(
					`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms...`,
					lastError.message,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
	throw lastError;
}

/**
 * Promise.allSettled 결과에서 성공한 값만 추출
 * 실패한 항목은 null로 대체
 */
function extractSettledResults<T>(
	results: PromiseSettledResult<T>[],
): (T | null)[] {
	return results.map((result) =>
		result.status === "fulfilled" ? result.value : null,
	);
}

// ============================================
// Progress Event Types
// ============================================
export type WorkflowPhase =
	| "logo-asset"
	| "analysis"
	| "identity"
	| "guidelines"
	| "content"
	| "complete"
	| "error";

export type WorkflowEvent =
	| { type: "phase-start"; phase: WorkflowPhase; message: string }
	| { type: "phase-complete"; phase: WorkflowPhase; message: string }
	| { type: "agent-start"; agent: string; message: string }
	| { type: "agent-complete"; agent: string; message: string }
	| {
			type: "complete";
			data: {
				identity: IdentityModel;
				guideline: GuidelineModel;
				copywriting: CopywritingContent;
				applications: ApplicationsContent;
				logoAsset: LogoAsset;
				marketContext: MarketContext;
			};
	  }
	| { type: "error"; error: string };

// ============================================
// Agent Runner Helpers
// ============================================
async function runVisionAgent(
	input: UserInput,
	logoAsset: LogoAsset,
): Promise<LogoAnalysis> {
	const agent = createVisionAgent();

	// Use multimodal message format to avoid context window overflow
	const prompt = [
		{
			role: "user" as const,
			content: [
				{
					type: "input_text" as const,
					text: `다음 로고 이미지를 분석해주세요.

브랜드 정보:
- 브랜드명: ${input.brandName}
- 산업: ${input.industry}

아래 JSON 형식으로 응답해주세요:
{
  "visualElements": ["시각적 요소 1", "시각적 요소 2"],
  "colors": ["#HEX1", "#HEX2"],
  "shapes": ["형태 1", "형태 2"],
  "style": "minimal | complex | geometric | organic | abstract",
  "mood": ["무드 키워드 1", "무드 키워드 2"],
  "symbolism": "로고가 담고 있는 상징적 의미"
}`,
				},
				{
					type: "input_image" as const,
					image: logoAsset.url,
					detail: "auto" as const,
				},
			],
		},
	];

	const result = await run(agent, prompt);
	const json = extractJson(result.finalOutput || "");
	return LogoAnalysisSchema.parse(json);
}

async function runAnalysisAgent(input: UserInput): Promise<MarketContext> {
	const agent = createAnalysisAgent();
	const prompt = `다음 정보를 바탕으로 MarketContext를 생성해주세요.

## 입력 정보
브랜드명: ${input.brandName}
산업: ${input.industry}
키워드: ${input.keywords?.join(", ") || "없음"}
타겟 오디언스: ${input.targetAudience || "없음"}

JSON 형식으로 응답해주세요:
{
  "industryOverview": "산업 개요 요약",
  "categoryTrends": ["트렌드 1", "트렌드 2"],
  "audienceInsights": ["오디언스 인사이트 1", "오디언스 인사이트 2"],
  "opportunityAreas": ["기회 영역 1", "기회 영역 2"]
}`;

	const result = await run(agent, prompt);
	const json = extractJson(result.finalOutput || "");
	return MarketContextSchema.parse(json);
}

async function runIdentityAgent(
	input: UserInput,
	logoAnalysis: LogoAnalysis,
	marketContext: MarketContext,
): Promise<IdentityModel> {
	const agent = createIdentityAgent();
	const prompt = `다음 정보를 바탕으로 브랜드 아이덴티티를 생성해주세요.

## 입력 정보
브랜드명: ${input.brandName}
산업: ${input.industry}
한줄 정의: ${input.oneLiner}
키워드: ${input.keywords?.join(", ") || "없음"}
타겟 오디언스: ${input.targetAudience || "없음"}
톤 레퍼런스: ${input.toneReference?.join(", ") || "없음"}
비전: ${input.vision || "없음"}
미션: ${input.mission || "없음"}

## 로고 분석 결과
${JSON.stringify(logoAnalysis, null, 2)}

## 시장/타겟 분석 결과
${JSON.stringify(marketContext, null, 2)}

## 응답 형식 (정확히 이 JSON 구조로 응답해주세요)
{
  "brand": {
    "name": "브랜드명",
    "tagline": "브랜드 태그라인 (짧고 기억에 남는 문구)",
    "oneLiner": "브랜드를 한 문장으로 설명",
    "description": "브랜드에 대한 상세 설명 (2-3문장)"
  },
  "philosophy": {
    "mission": "브랜드의 미션 (존재 이유)",
    "vision": "브랜드의 비전 (미래 목표)",
    "purpose": "브랜드의 목적 (사회적 가치)",
    "values": [
      { "name": "핵심가치1", "description": "가치에 대한 설명" },
      { "name": "핵심가치2", "description": "가치에 대한 설명" },
      { "name": "핵심가치3", "description": "가치에 대한 설명" }
    ]
  },
  "brandVision": {
    "visionStatement": "브랜드 비전 선언문",
    "brandTruths": ["브랜드 진실1", "브랜드 진실2", "브랜드 진실3"],
    "categoryInsight": "카테고리/시장에 대한 인사이트",
    "consumerInsight": "소비자에 대한 인사이트",
    "targetDefinition": "타겟 고객 정의"
  },
  "personality": {
    "archetypes": {
      "primary": "주요 브랜드 아키타입 (예: Creator, Hero, Caregiver 등)",
      "secondary": "보조 아키타입"
    },
    "traits": ["성격특성1", "성격특성2", "성격특성3", "성격특성4", "성격특성5"],
    "humanDescription": "이 브랜드가 사람이라면 어떤 사람일지 묘사"
  },
  "positioning": {
    "category": "브랜드가 속한 카테고리",
    "differentiator": "경쟁사와의 핵심 차별점",
    "promise": "고객에게 하는 브랜드 약속",
    "proof": ["약속을 뒷받침하는 증거1", "증거2", "증거3"]
  },
  "targetAudience": {
    "primary": {
      "description": "주요 타겟 고객 설명",
      "demographics": ["인구통계적 특성1", "특성2"],
      "psychographics": ["심리적 특성1", "특성2"],
      "painPoints": ["고객의 페인포인트1", "페인포인트2"],
      "goals": ["고객의 목표1", "목표2"]
    }
  },
  "voiceFoundation": {
    "toneKeywords": ["톤키워드1", "톤키워드2", "톤키워드3"],
    "formalityLevel": "professional",
    "energyLevel": "balanced"
  }
}

참고: formalityLevel은 "formal", "professional", "casual", "friendly" 중 하나로 선택하세요.
참고: energyLevel은 "calm", "balanced", "dynamic", "energetic" 중 하나로 선택하세요.`;

	const result = await run(agent, prompt);
	const json = extractJson(result.finalOutput || "");

	// Add required fields if missing
	const enriched = {
		id: generateId(),
		createdAt: new Date().toISOString(),
		...json,
		logoAnalysis,
	};

	return IdentityModelSchema.parse(enriched);
}

async function runGuidelineAgents(
	identity: IdentityModel,
	input: UserInput,
): Promise<Omit<GuidelineModel, "id" | "identityId" | "createdAt">> {
	// Run all guideline agents in parallel
	const [
		logoResult,
		colorResult,
		typographyResult,
		toneResult,
		visualResult,
		designStandardsResult,
	] = await Promise.all([
		// Logo Guide Agent
		withRetry(async () => {
			const agent = createLogoGuideAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 로고 가이드라인을 작성해주세요.

## 브랜드 아이덴티티
- 브랜드명: ${identity.brand.name}
- 태그라인: ${identity.brand.tagline}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "logo": {
    "description": "로고에 대한 설명",
    "usageRules": ["사용 규칙1", "사용 규칙2", "사용 규칙3"],
    "clearSpace": {
      "description": "여백 규칙 설명",
      "ratio": "로고 높이의 1/4"
    },
    "minimumSize": {
      "print": "25mm",
      "digital": "80px"
    },
    "variations": [
      { "name": "풀 컬러", "usage": "기본 사용" },
      { "name": "흑백", "usage": "단색 인쇄물" }
    ],
    "donts": ["금지사항1", "금지사항2", "금지사항3"]
  },
  "brandElements": {
    "contourBottle": {
      "description": "브랜드 고유 요소 설명 (없으면 '해당 없음')",
      "usageRules": ["규칙1"],
      "donts": ["금지1"]
    },
    "dynamicRibbon": {
      "description": "동적 요소 설명 (없으면 '해당 없음')",
      "spacingRules": ["간격 규칙1"],
      "lockupRules": ["락업 규칙1"],
      "donts": ["금지1"]
    }
  },
  "identityStandards": {
    "coBranding": {
      "rules": ["공동 브랜딩 규칙1", "규칙2"]
    },
    "legalLine": {
      "required": true,
      "rules": ["법적 표기 규칙1"],
      "examples": ["© 2024 브랜드명"]
    }
  }
}`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Color Agent
		withRetry(async () => {
			const agent = createColorAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 컬러 시스템을 설계해주세요.

## 브랜드 정보
- 브랜드명: ${identity.brand.name}
- 로고 색상: ${JSON.stringify(identity.logoAnalysis.colors)}
- 선호 색상 무드: ${input.preferences?.colorMood || "없음"}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "color": {
    "philosophy": "컬러 철학 설명 (문자열)",
    "primary": [
      {
        "name": "Primary Blue",
        "hex": "#0066CC",
        "rgb": { "r": 0, "g": 102, "b": 204 },
        "usage": "주요 브랜드 컬러",
        "meaning": "신뢰와 안정"
      }
    ],
    "secondary": [
      {
        "name": "Secondary Gray",
        "hex": "#666666",
        "rgb": { "r": 102, "g": 102, "b": 102 },
        "usage": "보조 텍스트",
        "meaning": "전문성"
      }
    ],
    "neutral": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "rgb": { "r": 255, "g": 255, "b": 255 },
        "usage": "배경"
      },
      {
        "name": "Black",
        "hex": "#000000",
        "rgb": { "r": 0, "g": 0, "b": 0 },
        "usage": "본문 텍스트"
      }
    ],
    "combinations": [
      {
        "name": "기본 조합",
        "colors": ["Primary Blue", "White"],
        "usage": "주요 마케팅 자료"
      }
    ],
    "accessibility": {
      "contrastRatios": [
        {
          "combination": "Primary Blue on White",
          "ratio": "7:1",
          "wcagLevel": "AAA"
        }
      ]
    },
    "donts": ["원색을 과도하게 사용하지 마세요", "브랜드 컬러를 변형하지 마세요"]
  }
}

참고: wcagLevel은 "AA" 또는 "AAA"만 사용하세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Typography Agent
		withRetry(async () => {
			const agent = createTypographyAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 타이포그래피 시스템을 설계해주세요.

## 브랜드 정보
- 브랜드명: ${identity.brand.name}
- 성격: ${identity.personality.traits.join(", ")}
- 산업: ${identity.positioning.category}
- 선호 스타일: ${input.preferences?.typographyStyle || "없음"}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "typography": {
    "philosophy": "타이포그래피 철학 설명",
    "direction": "sans-serif",
    "rationale": "산세리프 서체를 선택한 이유",
    "primary": {
      "family": "Pretendard",
      "fallback": ["Apple SD Gothic Neo", "sans-serif"],
      "weights": ["400", "500", "600", "700"],
      "source": "Google Fonts",
      "license": "OFL"
    },
    "hierarchy": {
      "h1": {
        "size": "48px",
        "weight": "700",
        "lineHeight": "1.2",
        "usage": "페이지 제목"
      },
      "h2": {
        "size": "36px",
        "weight": "600",
        "lineHeight": "1.3",
        "usage": "섹션 제목"
      },
      "h3": {
        "size": "24px",
        "weight": "600",
        "lineHeight": "1.4",
        "usage": "소제목"
      },
      "body": {
        "size": "16px",
        "weight": "400",
        "lineHeight": "1.6",
        "usage": "본문 텍스트"
      },
      "caption": {
        "size": "12px",
        "weight": "400",
        "lineHeight": "1.5",
        "usage": "캡션, 부가 정보"
      }
    },
    "rules": ["제목에는 bold 이상 사용", "본문은 regular 사용"],
    "donts": ["3가지 이상 폰트 혼용 금지", "극단적인 자간 조정 금지"]
  }
}

참고: direction은 "sans-serif", "serif", "geometric", "humanist", "mixed" 중 하나로 선택하세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Tone Agent
		withRetry(async () => {
			const agent = createToneAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 톤 오브 보이스 가이드라인을 작성해주세요.

## 브랜드 정보
- 브랜드명: ${identity.brand.name}
- 성격: ${identity.personality.traits.join(", ")}
- 타겟: ${identity.targetAudience.primary.description}
- 톤 키워드: ${identity.voiceFoundation.toneKeywords.join(", ")}
- 포멀리티: ${identity.voiceFoundation.formalityLevel}
- 금지 표현: ${input.prohibitedExpressions?.join(", ") || "없음"}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "tone": {
    "overview": "톤 오브 보이스 개요 설명 (문자열)",
    "principles": [
      {
        "name": "친근함",
        "description": "고객과 친구처럼 대화",
        "example": "안녕하세요! 오늘도 좋은 하루 되세요."
      },
      {
        "name": "전문성",
        "description": "신뢰감 있는 정보 전달",
        "example": "저희 제품은 ISO 인증을 받았습니다."
      }
    ],
    "writingStyle": {
      "characteristics": ["명확함", "간결함", "친근함"],
      "rules": ["능동태 사용", "짧은 문장 선호", "전문 용어 최소화"]
    },
    "examples": [
      {
        "context": "환영 메시지",
        "do": [
          {
            "text": "반갑습니다! 저희와 함께해 주셔서 감사해요.",
            "explanation": "친근하고 따뜻한 톤"
          }
        ],
        "dont": [
          {
            "text": "귀하의 가입을 환영합니다.",
            "explanation": "너무 딱딱하고 형식적"
          }
        ]
      }
    ],
    "vocabulary": {
      "preferred": ["함께", "쉽게", "빠르게", "안전하게"],
      "avoided": ["절대", "반드시", "무조건", "최고"]
    }
  }
}`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Visual Agent
		withRetry(async () => {
			const agent = createVisualAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 비주얼 요소 가이드라인을 작성해주세요.

## 브랜드 정보
- 브랜드명: ${identity.brand.name}
- 성격: ${identity.personality.traits.join(", ")}
- 로고 스타일: ${identity.logoAnalysis.style}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "visual": {
    "imagery": {
      "style": "자연스럽고 밝은 톤의 이미지",
      "characteristics": ["밝은 조명", "자연스러운 포즈", "깔끔한 배경"],
      "subjects": ["사람", "제품", "라이프스타일"],
      "treatments": ["높은 채도", "부드러운 그림자", "자연광 선호"],
      "donts": ["과도한 필터", "어두운 톤", "복잡한 배경"]
    },
    "iconography": {
      "style": "라인 아이콘",
      "strokeWidth": "2px",
      "cornerRadius": "2px",
      "guidelines": ["일관된 선 두께", "간결한 형태", "브랜드 컬러 사용"]
    },
    "layout": {
      "gridSystem": "12컬럼 그리드",
      "margins": "24px",
      "spacing": {
        "unit": "8px",
        "scale": ["8px", "16px", "24px", "32px", "48px", "64px"]
      }
    }
  }
}

참고: spacing.unit과 spacing.scale의 값은 반드시 문자열이어야 합니다 (예: "8px").`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Design Standards Agent
		withRetry(async () => {
			const agent = createDesignStandardsAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 디자인 스탠더드를 작성해주세요.

## 브랜드 정보
- 브랜드명: ${identity.brand.name}
- 산업: ${identity.positioning.category}

## 응답 형식 (정확히 이 JSON 구조로 응답)
{
  "designStandards": {
    "packaging": {
      "graphicRules": ["로고는 전면 상단에 배치", "제품명은 중앙 배치"],
      "formRules": ["친환경 소재 우선", "미니멀한 디자인"],
      "templates": ["박스형", "파우치형"]
    },
    "signage": {
      "rules": ["LED 조명 사용", "최소 높이 2m", "브랜드 컬러 유지"]
    },
    "fleet": {
      "rules": ["차량 측면에 로고 배치", "흰색 배경 유지"]
    },
    "promotions": {
      "rules": ["시즌별 캠페인 가이드 준수", "할인율 표기 규정"]
    },
    "customer": {
      "rules": ["응대 스크립트 준수", "브랜드 톤 유지"]
    }
  }
}`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),
	]);

	const result = {
		logo: (logoResult as Record<string, unknown>).logo || logoResult,
		brandElements: (logoResult as Record<string, unknown>).brandElements || {
			contourBottle: {
				description: "해당 없음",
				usageRules: [],
				donts: [],
			},
			dynamicRibbon: {
				description: "해당 없음",
				spacingRules: [],
				lockupRules: [],
				donts: [],
			},
		},
		identityStandards: (logoResult as Record<string, unknown>)
			.identityStandards || {
			coBranding: { rules: [] },
			legalLine: { required: false, rules: [], examples: [] },
		},
		color: (colorResult as Record<string, unknown>).color || colorResult,
		typography:
			(typographyResult as Record<string, unknown>).typography ||
			typographyResult,
		tone: (toneResult as Record<string, unknown>).tone || toneResult,
		visual: (visualResult as Record<string, unknown>).visual || visualResult,
		designStandards:
			(designStandardsResult as Record<string, unknown>).designStandards ||
			designStandardsResult,
	};

	return result as Omit<GuidelineModel, "id" | "identityId" | "createdAt">;
}

async function runContentAgents(
	identity: IdentityModel,
	guideline: Omit<GuidelineModel, "id" | "identityId" | "createdAt">,
): Promise<{
	copywriting: Omit<CopywritingContent, "id" | "identityId" | "guidelineId">;
	applications: Omit<ApplicationsContent, "id" | "identityId" | "guidelineId">;
}> {
	const identityJson = JSON.stringify(identity, null, 2);
	const guidelineJson = JSON.stringify(guideline, null, 2);

	const [copywritingResult, applicationsResult] = await Promise.all([
		// Copywriting Agent
		withRetry(async () => {
			const agent = createCopywritingAgent();
			const prompt = `다음 브랜드 정보를 바탕으로 카피를 작성해주세요.

## 브랜드 아이덴티티
${identityJson}

## 톤 가이드라인
${JSON.stringify(guideline.tone, null, 2)}

CopywritingContent 스키마에 맞는 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),

		// Applications Agent
		withRetry(async () => {
			const agent = createApplicationsAgent();
			const prompt = `다음 정보를 바탕으로 ApplicationsContent를 생성해주세요.

## 브랜드 아이덴티티
${identityJson}

## 가이드라인
${guidelineJson}

ApplicationsContent 스키마에 맞는 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		}),
	]);

	return {
		copywriting: copywritingResult as Omit<
			CopywritingContent,
			"id" | "identityId" | "guidelineId"
		>,
		applications: applicationsResult as Omit<
			ApplicationsContent,
			"id" | "identityId" | "guidelineId"
		>,
	};
}

// ============================================
// Main Workflow
// ============================================
export async function* runBrandWorkflow(
	input: UserInput,
	logoAsset: LogoAsset,
): AsyncGenerator<WorkflowEvent> {
	// 요청별 로그 컨텍스트 생성 (동시 요청 시 로그 충돌 방지)
	const logCtx = createLogContext();

	try {
		// Phase 1.5: Logo Asset (already provided)
		const logoAssetComplete: WorkflowEvent = {
			type: "phase-complete",
			phase: "logo-asset",
			message: "로고 에셋 처리 완료",
		};
		logWorkflowEvent(logoAssetComplete, logCtx);
		yield logoAssetComplete;

		// Phase 2: Analysis (parallel)
		const analysisStart: WorkflowEvent = {
			type: "phase-start",
			phase: "analysis",
			message: "분석 시작",
		};
		logWorkflowEvent(analysisStart, logCtx);
		yield analysisStart;

		const visionStart: WorkflowEvent = {
			type: "agent-start",
			agent: "vision",
			message: "로고 분석 중...",
		};
		logWorkflowEvent(visionStart, logCtx);
		yield visionStart;

		const analysisAgentStart: WorkflowEvent = {
			type: "agent-start",
			agent: "analysis",
			message: "시장 분석 중...",
		};
		logWorkflowEvent(analysisAgentStart, logCtx);
		yield analysisAgentStart;

		const [logoAnalysis, marketContext] = await Promise.all([
			withRetry(() => runVisionAgent(input, logoAsset)),
			withRetry(() => runAnalysisAgent(input)),
		]);

		const visionComplete: WorkflowEvent = {
			type: "agent-complete",
			agent: "vision",
			message: "로고 분석 완료",
		};
		logWorkflowEvent(visionComplete, logCtx);
		yield visionComplete;

		const analysisAgentComplete: WorkflowEvent = {
			type: "agent-complete",
			agent: "analysis",
			message: "시장 분석 완료",
		};
		logWorkflowEvent(analysisAgentComplete, logCtx);
		yield analysisAgentComplete;

		const analysisPhaseComplete: WorkflowEvent = {
			type: "phase-complete",
			phase: "analysis",
			message: "분석 완료",
		};
		logWorkflowEvent(analysisPhaseComplete, logCtx);
		yield analysisPhaseComplete;

		// Phase 3: Identity Model
		const identityPhaseStart: WorkflowEvent = {
			type: "phase-start",
			phase: "identity",
			message: "아이덴티티 생성 시작",
		};
		logWorkflowEvent(identityPhaseStart, logCtx);
		yield identityPhaseStart;

		const identityAgentStart: WorkflowEvent = {
			type: "agent-start",
			agent: "identity",
			message: "브랜드 아이덴티티 생성 중...",
		};
		logWorkflowEvent(identityAgentStart, logCtx);
		yield identityAgentStart;

		const identity = await withRetry(() =>
			runIdentityAgent(input, logoAnalysis, marketContext),
		);

		const identityAgentComplete: WorkflowEvent = {
			type: "agent-complete",
			agent: "identity",
			message: "아이덴티티 생성 완료",
		};
		logWorkflowEvent(identityAgentComplete, logCtx);
		yield identityAgentComplete;

		const identityPhaseComplete: WorkflowEvent = {
			type: "phase-complete",
			phase: "identity",
			message: "아이덴티티 완료",
		};
		logWorkflowEvent(identityPhaseComplete, logCtx);
		yield identityPhaseComplete;

		// Phase 4: Guideline Model (6 agents in parallel)
		const guidelinesPhaseStart: WorkflowEvent = {
			type: "phase-start",
			phase: "guidelines",
			message: "가이드라인 생성 시작",
		};
		logWorkflowEvent(guidelinesPhaseStart, logCtx);
		yield guidelinesPhaseStart;

		const guidelineAgents = [
			"logo-guide",
			"color",
			"typography",
			"tone",
			"visual",
			"design-standards",
		];
		for (const agent of guidelineAgents) {
			const agentStart: WorkflowEvent = {
				type: "agent-start",
				agent,
				message: `${agent} 생성 중...`,
			};
			logWorkflowEvent(agentStart, logCtx);
			yield agentStart;
		}

		const guidelinePartial = await runGuidelineAgents(identity, input);

		for (const agent of guidelineAgents) {
			const agentComplete: WorkflowEvent = {
				type: "agent-complete",
				agent,
				message: `${agent} 완료`,
			};
			logWorkflowEvent(agentComplete, logCtx);
			yield agentComplete;
		}

		const guideline: GuidelineModel = GuidelineModelSchema.parse({
			id: generateId(),
			identityId: identity.id,
			createdAt: new Date().toISOString(),
			...guidelinePartial,
		});

		const guidelinesPhaseComplete: WorkflowEvent = {
			type: "phase-complete",
			phase: "guidelines",
			message: "가이드라인 완료",
		};
		logWorkflowEvent(guidelinesPhaseComplete, logCtx);
		yield guidelinesPhaseComplete;

		// Phase 5: Content Generation (2 agents in parallel)
		const contentPhaseStart: WorkflowEvent = {
			type: "phase-start",
			phase: "content",
			message: "콘텐츠 생성 시작",
		};
		logWorkflowEvent(contentPhaseStart, logCtx);
		yield contentPhaseStart;

		const copywritingStart: WorkflowEvent = {
			type: "agent-start",
			agent: "copywriting",
			message: "카피라이팅 중...",
		};
		logWorkflowEvent(copywritingStart, logCtx);
		yield copywritingStart;

		const applicationsStart: WorkflowEvent = {
			type: "agent-start",
			agent: "applications",
			message: "적용 예시 생성 중...",
		};
		logWorkflowEvent(applicationsStart, logCtx);
		yield applicationsStart;

		const contentPartial = await runContentAgents(identity, guidelinePartial);

		const copywriting: CopywritingContent = CopywritingContentSchema.parse({
			id: generateId(),
			identityId: identity.id,
			guidelineId: guideline.id,
			...contentPartial.copywriting,
		});

		const applications: ApplicationsContent = ApplicationsContentSchema.parse({
			id: generateId(),
			identityId: identity.id,
			guidelineId: guideline.id,
			...contentPartial.applications,
		});

		const copywritingComplete: WorkflowEvent = {
			type: "agent-complete",
			agent: "copywriting",
			message: "카피라이팅 완료",
		};
		logWorkflowEvent(copywritingComplete, logCtx);
		yield copywritingComplete;

		const applicationsComplete: WorkflowEvent = {
			type: "agent-complete",
			agent: "applications",
			message: "적용 예시 완료",
		};
		logWorkflowEvent(applicationsComplete, logCtx);
		yield applicationsComplete;

		const contentPhaseComplete: WorkflowEvent = {
			type: "phase-complete",
			phase: "content",
			message: "콘텐츠 생성 완료",
		};
		logWorkflowEvent(contentPhaseComplete, logCtx);
		yield contentPhaseComplete;

		// Complete
		const completeEvent: WorkflowEvent = {
			type: "complete",
			data: {
				identity,
				guideline,
				copywriting,
				applications,
				logoAsset,
				marketContext,
			},
		};
		logWorkflowEvent(completeEvent, logCtx);
		yield completeEvent;
	} catch (error) {
		const errorEvent: WorkflowEvent = {
			type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		};
		logWorkflowEvent(errorEvent, logCtx);

		if (process.env.WORKFLOW_LOG_LEVEL === "debug" && error instanceof Error) {
			console.error("Stack trace:", error.stack);
		}

		yield errorEvent;
	}
}

// ============================================
// Utility Functions
// ============================================
function extractJson(text: string): Record<string, unknown> {
	// Try to find JSON in the text
	const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (jsonMatch) {
		return JSON.parse(jsonMatch[1].trim());
	}

	// Try to parse the entire text as JSON
	const trimmed = text.trim();
	if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
		return JSON.parse(trimmed);
	}

	throw new Error("Could not extract JSON from response");
}
