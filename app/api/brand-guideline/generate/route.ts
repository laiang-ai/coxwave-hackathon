import { run } from "@openai/agents";
import { NextResponse } from "next/server";
import {
  LogoAssetSchema,
  runBrandWorkflow,
  UserInputSchema,
  type WorkflowEvent,
} from "@/lib/brand-guideline";
import { sanitizeUserInput } from "@/lib/agents/safety";
import { createBrandTypeAgent } from "@/lib/agents/agents/brand-type";

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

    // Safety validation - check for prompt injection and dangerous patterns
    const safetyResult = sanitizeUserInput(userInput);
    if (!safetyResult.isValid) {
      console.warn("Safety warnings detected:", safetyResult.warnings);
      // Log warnings but don't block - allow with monitoring
      // For stricter enforcement, uncomment:
      // return NextResponse.json(
      // 	{ error: "Input validation failed", details: safetyResult.warnings },
      // 	{ status: 400 },
      // );
    }

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
              try {
                const brandTypeAgent = createBrandTypeAgent();
                const toolInput = {
                  identity: event.data.identity,
                  guideline: event.data.guideline,
                  logoAsset: event.data.logoAsset,
                };
                const brandTypeResult = await run(brandTypeAgent, [
                  {
                    role: "user",
                    content: [
                      {
                        type: "input_text",
                        text: `Call generate_brand_type with this JSON:\n${JSON.stringify(
                          toolInput,
                        )}`,
                      },
                    ],
                  },
                ]);
                const brandType = brandTypeResult.finalOutput;
                if (!brandType || typeof brandType !== "object") {
                  throw new Error("BrandType generation failed.");
                }
                console.log("[API] generate_brand_type success", brandType);

                sendEvent({
                  type: "complete",
                  data: {
                    ...event.data,
                    brandType,
                  },
                } as unknown as WorkflowEvent);
              } catch (transformError) {
                console.error("[API] BrandType generation error:", transformError);
                sendEvent({
                  type: "error",
                  error:
                    transformError instanceof Error
                      ? transformError.message
                      : "BrandType generation failed.",
                });
              }
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
