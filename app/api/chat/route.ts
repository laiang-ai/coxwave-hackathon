import { run } from "@openai/agents";
import type { AgentId } from "@/lib/agents";
import { listAgents } from "@/lib/agents";
import { routeAgent } from "@/lib/agents/router";

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
