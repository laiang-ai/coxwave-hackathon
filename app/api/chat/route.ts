import { run } from "@openai/agents";
import type { AgentId } from "@/lib/agents";
import { getAgent, listAgents } from "@/lib/agents";
import { routeAgent } from "@/lib/agents/router";

type UserMessageItem = {
	role: "user";
	content: Array<{ type: string; text?: string; image?: string }>;
};

// Extract image data URLs from the last user message
function extractImages(messages: unknown[]): string[] {
	const reversed = [...messages].reverse();
	const lastUser = reversed.find(
		(item) => (item as UserMessageItem).role === "user",
	) as UserMessageItem | undefined;

	if (!lastUser || typeof lastUser.content === "string") return [];

	return lastUser.content
		.filter((part) => part.type === "input_image" && part.image)
		.map((part) => part.image as string);
}

// Check if message contains brand-related keywords
function hasBrandKeywords(messages: unknown[]): boolean {
	const reversed = [...messages].reverse();
	const lastUser = reversed.find(
		(item) => (item as UserMessageItem).role === "user",
	) as UserMessageItem | undefined;

	if (!lastUser) return false;

	const text =
		typeof lastUser.content === "string"
			? lastUser.content
			: lastUser.content
					.filter((part) => part.type === "input_text")
					.map((part) => part.text ?? "")
					.join(" ");

	const brandKeywords = [
		"브랜드",
		"BI",
		"가이드라인",
		"로고",
		"brand",
		"logo",
		"identity",
		"guideline",
	];
	return brandKeywords.some((keyword) =>
		text.toLowerCase().includes(keyword.toLowerCase()),
	);
}

// Run brand analysis with Vision + Analysis agents
async function runBrandAnalysis(
	logoDataUrl: string,
	userText: string,
): Promise<{ content: string; logoAnalysis: string; marketContext: string }> {
	const visionAgent = getAgent("vision");
	const analysisAgent = getAgent("analysis");

	const visionPrompt = [
		{
			role: "user" as const,
			content: [
				{
					type: "input_text" as const,
					text: `이 로고 이미지를 분석해주세요. 다음 항목을 포함해주세요:
1. 로고의 시각적 특징 (색상, 형태, 타이포그래피)
2. 브랜드 느낌과 분위기
3. 업종 추정
4. 브랜드 성격 추정

사용자 추가 정보: ${userText || "없음"}`,
				},
				{
					type: "input_image" as const,
					image: logoDataUrl,
					detail: "auto" as const,
				},
			],
		},
	];

	const analysisPrompt = [
		{
			role: "user" as const,
			content: [
				{
					type: "input_text" as const,
					text: `브랜드 시장 분석을 해주세요:
1. 이 브랜드가 속할 수 있는 산업 분야
2. 타겟 오디언스 추정
3. 브랜드 포지셔닝 방향
4. 차별화 기회

사용자 정보: ${userText || "없음"}`,
				},
			],
		},
	];

	const [visionResult, analysisResult] = await Promise.all([
		run(visionAgent, visionPrompt),
		run(analysisAgent, analysisPrompt),
	]);

	const logoAnalysis = visionResult.finalOutput ?? "";
	const marketContext = analysisResult.finalOutput ?? "";

	const content = `## 브랜드 분석 결과

### 로고 분석
${logoAnalysis}

### 시장 컨텍스트
${marketContext}

---
위 분석을 바탕으로 전체 브랜드 가이드라인을 생성할 수 있습니다.`;

	return { content, logoAnalysis, marketContext };
}

export async function POST(req: Request) {
	const body = await req.json();
	const messages = Array.isArray(body?.messages) ? body.messages : null;
	const availableAgents = listAgents();
	const isAgentId = (value: string): value is AgentId =>
		availableAgents.includes(value as AgentId);
	const preferredAgentId =
		typeof body?.agentId === "string" && isAgentId(body.agentId)
			? body.agentId
			: undefined;
	const routeStrategy = body?.routeStrategy === "manual" ? "manual" : "auto";

	if (!messages) {
		return new Response("Invalid payload", { status: 400 });
	}

	// Check for brand analysis mode (image present)
	const images = extractImages(messages);
	const hasBrand = hasBrandKeywords(messages) || images.length > 0;

	if (images.length > 0 && hasBrand) {
		// Brand analysis mode
		const lastUserMessage = messages.findLast(
			(m: { role: string }) => m.role === "user",
		) as UserMessageItem | undefined;
		const userText =
			lastUserMessage?.content?.find?.(
				(c: { type: string }) => c.type === "input_text",
			)?.text ?? "";

		try {
			const { content, logoAnalysis, marketContext } = await runBrandAnalysis(
				images[0],
				userText,
			);

			// Return structured response with action
			const responseData = {
				content,
				action: {
					type: "generate-guidelines",
					label: "전체 가이드라인 생성하기",
					data: {
						logoDataUrl: images[0],
						logoAnalysis,
						marketContext,
					},
				},
			};

			return new Response(JSON.stringify(responseData), {
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
					"X-Agent-Id": "brand-analysis",
					"X-Route-Reason": "brand_analysis_mode",
					"X-Brand-Analysis": "true",
				},
			});
		} catch (error) {
			console.error("Brand analysis error:", error);
			// Fall through to normal chat
		}
	}

	// Normal chat mode
	const { agent, decision } = routeAgent(messages, {
		strategy: routeStrategy,
		preferredAgentId,
	});
	const result = await run(agent, messages, { stream: true });
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const event of result) {
					if (
						event.type === "raw_model_stream_event" &&
						event.data?.type === "output_text_delta"
					) {
						controller.enqueue(encoder.encode(event.data.delta ?? ""));
					}
				}
			} catch (error) {
				console.error("Chat stream error:", error);
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-store",
			"X-Agent-Id": decision.agentId,
			"X-Route-Reason": decision.reason,
		},
	});
}
