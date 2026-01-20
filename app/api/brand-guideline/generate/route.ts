import { NextResponse } from "next/server";
import {
	UserInputSchema,
	LogoAssetSchema,
	runBrandWorkflow,
	toBrandType,
	type WorkflowEvent,
} from "@/lib/brand-guideline";

export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
	try {
		const body = await req.json();

		// Validate user input
		const userInputResult = UserInputSchema.safeParse(body.userInput);
		if (!userInputResult.success) {
			return NextResponse.json(
				{ error: "Invalid user input", details: userInputResult.error.issues },
				{ status: 400 },
			);
		}

		// Validate logo asset
		const logoAssetResult = LogoAssetSchema.safeParse(body.logoAsset);
		if (!logoAssetResult.success) {
			return NextResponse.json(
				{ error: "Invalid logo asset", details: logoAssetResult.error.issues },
				{ status: 400 },
			);
		}

		const userInput = userInputResult.data;
		const logoAsset = logoAssetResult.data;

		// Create SSE stream for progress updates
		const encoder = new TextEncoder();

		const stream = new ReadableStream({
			async start(controller) {
				const sendEvent = (event: WorkflowEvent) => {
					const data = JSON.stringify(event);
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				};

				try {
					for await (const event of runBrandWorkflow(userInput, logoAsset)) {
						if (event.type === "complete") {
							// Transform to BrandType and send final result
							const brandType = toBrandType(
								event.data.identity,
								event.data.guideline,
								event.data.logoAsset,
							);

							sendEvent({
								type: "complete",
								data: {
									...event.data,
									brandType,
								},
							} as unknown as WorkflowEvent);
						} else {
							sendEvent(event);
						}
					}
				} catch (error) {
					console.error("Workflow error:", error);
					sendEvent({
						type: "error",
						error: error instanceof Error ? error.message : "Unknown error",
					});
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}

// Health check endpoint
export async function GET() {
	return NextResponse.json({
		status: "ok",
		endpoint: "brand-guideline/generate",
	});
}
