import { run } from "@openai/agents";
import type {
	UserInput,
	LogoAsset,
	LogoAnalysis,
	MarketContext,
	IdentityModel,
	GuidelineModel,
	CopywritingContent,
	ApplicationsContent,
} from "../schemas";
import {
	LogoAnalysisSchema,
	MarketContextSchema,
	IdentityModelSchema,
	GuidelineModelSchema,
	CopywritingContentSchema,
	ApplicationsContentSchema,
} from "../schemas";
import { createVisionAgent } from "@/lib/agents/agents/vision";
import { createAnalysisAgent } from "@/lib/agents/agents/analysis";
import { createIdentityAgent } from "@/lib/agents/agents/identity";
import { createLogoGuideAgent } from "@/lib/agents/agents/logo-guide";
import { createColorAgent } from "@/lib/agents/agents/color";
import { createTypographyAgent } from "@/lib/agents/agents/typography";
import { createToneAgent } from "@/lib/agents/agents/tone";
import { createVisualAgent } from "@/lib/agents/agents/visual";
import { createDesignStandardsAgent } from "@/lib/agents/agents/design-standards";
import { createCopywritingAgent } from "@/lib/agents/agents/copywriting";
import { createApplicationsAgent } from "@/lib/agents/agents/applications";

// UUID helper using crypto.randomUUID()
const generateId = () => crypto.randomUUID();

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
	const prompt = `다음 로고 이미지를 분석해주세요.

브랜드 정보:
- 브랜드명: ${input.brandName}
- 산업: ${input.industry}

로고 이미지 URL: ${logoAsset.url}

아래 JSON 형식으로 응답해주세요:
{
  "visualElements": ["시각적 요소 1", "시각적 요소 2"],
  "colors": ["#HEX1", "#HEX2"],
  "shapes": ["형태 1", "형태 2"],
  "style": "minimal | complex | geometric | organic | abstract",
  "mood": ["무드 키워드 1", "무드 키워드 2"],
  "symbolism": "로고가 담고 있는 상징적 의미"
}`;

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

## 생성해야 할 항목
1. 브랜드 철학: 미션, 비전, 핵심 가치 (3-5개)
2. 브랜드 비전: 비전 선언, 브랜드 진실, 카테고리/소비자 인사이트, 타겟 정의
3. 브랜드 성격: 브랜드 아키타입 (1-2개), 성격 특성 (3-5개)
4. 포지셔닝: 차별점, 브랜드 약속, 증거
5. 타겟 오디언스: 상세 프로파일
6. 보이스 기초: 톤 키워드 (3-5개), 포멀리티 수준

IdentityModel 스키마에 맞는 JSON 형식으로 응답해주세요. id와 createdAt 필드도 포함하세요.`;

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
	const identityJson = JSON.stringify(identity, null, 2);

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
		(async () => {
			const agent = createLogoGuideAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 로고 가이드라인을 작성해주세요.

## 브랜드 아이덴티티
${identityJson}

로고, brandElements, identityStandards 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Color Agent
		(async () => {
			const agent = createColorAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 컬러 시스템을 설계해주세요.

## 브랜드 아이덴티티
${identityJson}

## 로고에서 추출된 색상
${JSON.stringify(identity.logoAnalysis.colors)}

## 선호 색상 무드
${input.preferences?.colorMood || "없음"}

color 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Typography Agent
		(async () => {
			const agent = createTypographyAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 타이포그래피 시스템을 설계해주세요.

## 브랜드 아이덴티티
- 브랜드명: ${identity.brand.name}
- 성격: ${identity.personality.traits.join(", ")}
- 산업: ${identity.positioning.category}

## 선호 스타일
${input.preferences?.typographyStyle || "없음"}

typography 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Tone Agent
		(async () => {
			const agent = createToneAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 톤 오브 보이스 가이드라인을 작성해주세요.

## 브랜드 아이덴티티
- 브랜드명: ${identity.brand.name}
- 성격: ${identity.personality.traits.join(", ")}
- 타겟: ${identity.targetAudience.primary.description}
- 톤 키워드: ${identity.voiceFoundation.toneKeywords.join(", ")}
- 포멀리티: ${identity.voiceFoundation.formalityLevel}
- 에너지 레벨: ${identity.voiceFoundation.energyLevel}

## 사용자가 지정한 금지 표현
${input.prohibitedExpressions?.join(", ") || "없음"}

tone 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Visual Agent
		(async () => {
			const agent = createVisualAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 비주얼 요소 가이드라인을 작성해주세요.

## 브랜드 아이덴티티
${identityJson}

visual 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Design Standards Agent
		(async () => {
			const agent = createDesignStandardsAgent();
			const prompt = `다음 브랜드 아이덴티티를 기반으로 디자인 스탠더드를 작성해주세요.

## 브랜드 아이덴티티
${identityJson}

designStandards 섹션을 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),
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
		(async () => {
			const agent = createCopywritingAgent();
			const prompt = `다음 브랜드 정보를 바탕으로 카피를 작성해주세요.

## 브랜드 아이덴티티
${identityJson}

## 톤 가이드라인
${JSON.stringify(guideline.tone, null, 2)}

CopywritingContent 스키마에 맞는 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),

		// Applications Agent
		(async () => {
			const agent = createApplicationsAgent();
			const prompt = `다음 정보를 바탕으로 ApplicationsContent를 생성해주세요.

## 브랜드 아이덴티티
${identityJson}

## 가이드라인
${guidelineJson}

ApplicationsContent 스키마에 맞는 JSON 형식으로 응답해주세요.`;

			const result = await run(agent, prompt);
			return extractJson(result.finalOutput || "");
		})(),
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
	try {
		// Phase 1.5: Logo Asset (already provided)
		yield {
			type: "phase-complete",
			phase: "logo-asset",
			message: "로고 에셋 처리 완료",
		};

		// Phase 2: Analysis (parallel)
		yield { type: "phase-start", phase: "analysis", message: "분석 시작" };

		yield { type: "agent-start", agent: "vision", message: "로고 분석 중..." };
		yield {
			type: "agent-start",
			agent: "analysis",
			message: "시장 분석 중...",
		};

		const [logoAnalysis, marketContext] = await Promise.all([
			runVisionAgent(input, logoAsset),
			runAnalysisAgent(input),
		]);

		yield {
			type: "agent-complete",
			agent: "vision",
			message: "로고 분석 완료",
		};
		yield {
			type: "agent-complete",
			agent: "analysis",
			message: "시장 분석 완료",
		};
		yield { type: "phase-complete", phase: "analysis", message: "분석 완료" };

		// Phase 3: Identity Model
		yield {
			type: "phase-start",
			phase: "identity",
			message: "아이덴티티 생성 시작",
		};
		yield {
			type: "agent-start",
			agent: "identity",
			message: "브랜드 아이덴티티 생성 중...",
		};

		const identity = await runIdentityAgent(input, logoAnalysis, marketContext);

		yield {
			type: "agent-complete",
			agent: "identity",
			message: "아이덴티티 생성 완료",
		};
		yield {
			type: "phase-complete",
			phase: "identity",
			message: "아이덴티티 완료",
		};

		// Phase 4: Guideline Model (6 agents in parallel)
		yield {
			type: "phase-start",
			phase: "guidelines",
			message: "가이드라인 생성 시작",
		};

		const guidelineAgents = [
			"logo-guide",
			"color",
			"typography",
			"tone",
			"visual",
			"design-standards",
		];
		for (const agent of guidelineAgents) {
			yield { type: "agent-start", agent, message: `${agent} 생성 중...` };
		}

		const guidelinePartial = await runGuidelineAgents(identity, input);

		for (const agent of guidelineAgents) {
			yield { type: "agent-complete", agent, message: `${agent} 완료` };
		}

		const guideline: GuidelineModel = GuidelineModelSchema.parse({
			id: generateId(),
			identityId: identity.id,
			createdAt: new Date().toISOString(),
			...guidelinePartial,
		});

		yield {
			type: "phase-complete",
			phase: "guidelines",
			message: "가이드라인 완료",
		};

		// Phase 5: Content Generation (2 agents in parallel)
		yield {
			type: "phase-start",
			phase: "content",
			message: "콘텐츠 생성 시작",
		};
		yield {
			type: "agent-start",
			agent: "copywriting",
			message: "카피라이팅 중...",
		};
		yield {
			type: "agent-start",
			agent: "applications",
			message: "적용 예시 생성 중...",
		};

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

		yield {
			type: "agent-complete",
			agent: "copywriting",
			message: "카피라이팅 완료",
		};
		yield {
			type: "agent-complete",
			agent: "applications",
			message: "적용 예시 완료",
		};
		yield {
			type: "phase-complete",
			phase: "content",
			message: "콘텐츠 생성 완료",
		};

		// Complete
		yield {
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
	} catch (error) {
		yield {
			type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		};
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
