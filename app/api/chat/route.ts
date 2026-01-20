import { run } from "@openai/agents";
import type { AgentId } from "@/lib/agents";
import { getAgent, listAgents } from "@/lib/agents";
import { routeAgent } from "@/lib/agents/router";

type UserMessageItem = {
	role: "user";
	content: Array<{ type: string; text?: string; image?: string }>;
};

function extractJsonFromText(text: string): Record<string, unknown> {
	const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (jsonMatch) {
		return JSON.parse(jsonMatch[1].trim());
	}
	return JSON.parse(text.trim());
}

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
): Promise<{
	content: string;
	logoAnalysis: string;
	marketContext: Record<string, unknown>;
}> {
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

사용자 정보: ${userText || "없음"}

응답은 반드시 아래 JSON 형식으로만 제공하세요:
{
  "summary": "사용자에게 보여줄 자연스러운 요약 텍스트 (2-3문단, 마크다운 불렛포인트 사용 가능)",
  "data": {
    "industry": "추정 산업 분야",
    "targetAudience": "타겟 오디언스",
    "positioning": "브랜드 포지셔닝 방향",
    "differentiation": "차별화 기회"
  }
}`,
				},
			],
		},
	];

	const [visionResult, analysisResult] = await Promise.all([
		run(visionAgent, visionPrompt),
		run(analysisAgent, analysisPrompt),
	]);

	const logoAnalysis = visionResult.finalOutput ?? "";
	const marketContextRaw = analysisResult.finalOutput ?? "";

	// JSON 파싱하여 summary와 data 분리
	let marketContextSummary = "";
	let marketContextData: Record<string, unknown> = {};
	try {
		const parsed = extractJsonFromText(marketContextRaw) as Record<
			string,
			unknown
		>;
		if (typeof parsed.summary === "string") {
			marketContextSummary = parsed.summary;
		}
		if (parsed.data && typeof parsed.data === "object") {
			marketContextData = parsed.data as Record<string, unknown>;
		} else if (parsed.industryOverview) {
			const overview = String(parsed.industryOverview ?? "");
			const trends = Array.isArray(parsed.categoryTrends)
				? parsed.categoryTrends
				: [];
			const audience = Array.isArray(parsed.audienceInsights)
				? parsed.audienceInsights
				: [];
			const opportunities = Array.isArray(parsed.opportunityAreas)
				? parsed.opportunityAreas
				: [];
			marketContextSummary = [
				overview,
				trends.length > 0 ? `- 트렌드: ${trends.join(", ")}` : "",
				audience.length > 0 ? `- 오디언스: ${audience.join(", ")}` : "",
				opportunities.length > 0
					? `- 기회 영역: ${opportunities.join(", ")}`
					: "",
			]
				.filter(Boolean)
				.join("\n");
			marketContextData = {
				industryOverview: overview,
				categoryTrends: trends,
				audienceInsights: audience,
				opportunityAreas: opportunities,
			};
		}
	} catch {
		// JSON 파싱 실패 시 원본 텍스트를 summary로 사용
		marketContextSummary = marketContextRaw;
	}

	const content = `## 브랜드 분석 결과

### 로고 분석
${logoAnalysis}

### 시장 컨텍스트
${marketContextSummary}

---
위 분석을 바탕으로 전체 브랜드 가이드라인을 생성할 수 있습니다.`;

	return { content, logoAnalysis, marketContext: marketContextData };
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

	// Track tool execution results for brand updates
	const brandUpdates: Array<{ path: string; value: any; reason?: string }> = [];
	let fullContent = "";
	const updateKeys = new Set<string>();

	const addBrandUpdate = (
		path: string,
		value: any,
		reason?: string,
		callId?: string,
	) => {
		const key = callId ?? `${path}:${JSON.stringify(value)}`;
		if (updateKeys.has(key)) return;
		updateKeys.add(key);
		brandUpdates.push({ path, value, reason });
	};

	const parseToolArgs = (args: unknown) => {
		if (!args) return null;
		if (typeof args === "string") {
			try {
				return JSON.parse(args);
			} catch {
				return null;
			}
		}
		if (typeof args === "object") return args as Record<string, unknown>;
		return null;
	};

	const extractToolOutputText = (output: unknown) => {
		if (!output) return "";
		if (typeof output === "string") return output;
		if (Array.isArray(output)) {
			return output
				.map((part) => (typeof part?.text === "string" ? part.text : ""))
				.join("");
		}
		if (typeof output === "object") {
			const maybeText = (output as { text?: unknown }).text;
			if (typeof maybeText === "string") return maybeText;
		}
		return "";
	};

	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const event of result) {
					// Debug: log all events to understand structure
					console.log(
						"Event type:",
						event.type,
						"Data:",
<<<<<<< Updated upstream
						JSON.stringify(
							event.type === "run_item_stream_event"
								? { name: event.name, itemType: event.item?.type }
								: (event as any).data || {},
						),
=======
						JSON.stringify(event.data || {}),
>>>>>>> Stashed changes
					);

					// Stream text deltas to client
					if (
						event.type === "raw_model_stream_event" &&
						event.data?.type === "output_text_delta"
					) {
						const delta = event.data.delta ?? "";
						fullContent += delta;
						const chunk = JSON.stringify({ content: delta }) + "\n";
						controller.enqueue(encoder.encode(`data: ${chunk}`));
					}

					// Capture tool calls from run item stream events
					if (
<<<<<<< Updated upstream
						event.type === "run_item_stream_event" &&
						event.name === "tool_called"
					) {
						const rawItem = event.item?.rawItem;
						if (
							rawItem?.type === "function_call" &&
							rawItem.name === "update_brand_property"
						) {
							const args = parseToolArgs(rawItem.arguments);
							const path =
								typeof args?.["path"] === "string" ? args["path"] : undefined;
							const newValue = args?.["newValue"];
							const reason =
								typeof args?.["reason"] === "string"
									? args["reason"]
									: undefined;
							if (path && newValue !== undefined) {
								addBrandUpdate(path, newValue, reason, rawItem.callId);
							}
						}
					}

					// Capture tool outputs for cases where arguments are not available
					if (
						event.type === "run_item_stream_event" &&
						event.name === "tool_output"
					) {
						const rawItem = event.item?.rawItem;
						if (
							rawItem?.type === "function_call_result" &&
							rawItem.name === "update_brand_property"
						) {
							const outputText = extractToolOutputText(
								(event.item as any)?.output ?? rawItem.output,
							);
							const result = parseToolArgs(outputText);
							const path =
								typeof result?.["path"] === "string"
									? result["path"]
									: undefined;
							const newValue = result?.["newValue"];
							const reason =
								typeof result?.["reason"] === "string"
									? result["reason"]
									: undefined;
							if (path && newValue !== undefined) {
								addBrandUpdate(path, newValue, reason, rawItem.callId);
=======
						(event.type === "tool_call" ||
							event.type === "tool_call_started" ||
							event.type === "raw_tool_call") &&
						event.data?.name === "update_brand_property"
					) {
						console.log("Tool call detected:", event.data);
						const args = event.data.arguments || event.data.args || {};
						const { path, newValue, reason } = args;
						if (path && newValue !== undefined) {
							brandUpdates.push({ path, value: newValue, reason });
							console.log("Brand update added:", {
								path,
								value: newValue,
								reason,
							});
						}
					}

					// Also try capturing from tool results
					if (
						event.type === "tool_result" &&
						event.data?.tool_name === "update_brand_property"
					) {
						console.log("Tool result detected:", event.data);
						try {
							const result = JSON.parse(event.data.result || "{}");
							if (result.path && result.newValue !== undefined) {
								brandUpdates.push({
									path: result.path,
									value: result.newValue,
									reason: result.reason,
								});
								console.log("Brand update from result:", {
									path: result.path,
									value: result.newValue,
								});
>>>>>>> Stashed changes
							}
						}
					}
				}

				// Send final updates array after streaming completes
				if (brandUpdates.length > 0) {
					const finalChunk = JSON.stringify({ updates: brandUpdates }) + "\n";
					controller.enqueue(encoder.encode(`data: ${finalChunk}`));
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
