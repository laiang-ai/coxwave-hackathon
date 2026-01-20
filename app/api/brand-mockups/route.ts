import { NextResponse } from "next/server";
import OpenAI from "openai";

type BrandSnapshot = {
  meta?: {
    brandName?: string;
  };
  color?: {
    brand?: {
      primary?: { hex?: string };
      secondary?: { hex?: string };
      accent?: { hex?: string };
    };
  };
  typography?: {
    titleFont?: { name?: string };
    bodyFont?: { name?: string };
    scale?: {
      display?: { large?: { fontFamily?: string } };
    };
  };
  brandOverview?: {
    mission?: string;
    vision?: string;
    values?: string[];
  };
  toneOfVoice?: {
    traits?: Array<{ name: string }>;
  };
  visualElements?: {
    illustrations?: { style?: string };
    patterns?: { usage?: string };
  };
};

type RequestBody = {
  brand?: BrandSnapshot;
  prompt?: string;
  scene?: string;
  aspect?: "portrait" | "landscape" | "square";
  count?: number;
};

const scenePresets: Record<
  string,
  { label: string; prompt: string; defaultHint: string }
> = {
  "product-hero": {
    label: "Product Hero",
    prompt:
      "Studio product hero shot on a minimal plinth, crisp materials, soft diffused daylight, subtle reflections.",
    defaultHint:
      "Example: premium coffee can, skincare serum, smart device launch",
  },
  "bus-stop": {
    label: "Bus Stop Campaign",
    prompt:
      "Urban bus stop shelter with a full-height poster ad, evening city glow, light traffic blur, wet pavement reflections.",
    defaultHint: "Example: event poster, new service launch campaign",
  },
  "event-poster": {
    label: "Event Poster",
    prompt:
      "Gallery corridor with framed event posters, soft spotlighting, people walking slightly blurred in background.",
    defaultHint: "Example: pop-up exhibit, brand collaboration event",
  },
  "retail-display": {
    label: "Retail Display",
    prompt:
      "Retail shelf display with branded product lineup, tidy merchandising, warm ambient lighting, shallow depth of field.",
    defaultHint: "Example: convenience store shelf, limited edition launch",
  },
  "packaging-set": {
    label: "Packaging Set",
    prompt:
      "Packaging set on a textured tabletop, overhead softbox lighting, premium print finish, clean shadows.",
    defaultHint: "Example: gift set, sample kit, merch box",
  },
};

const list = (items: Array<string | undefined | null>) =>
  items.filter((item): item is string => Boolean(item && item.trim()));

const buildPrompt = (
  brand: BrandSnapshot,
  scenePrompt: string,
  userPrompt: string,
  aspect: RequestBody["aspect"],
) => {
  const brandName = brand.meta?.brandName || "Brand";
  const palette = list([
    brand.color?.brand?.primary?.hex,
    brand.color?.brand?.secondary?.hex,
    brand.color?.brand?.accent?.hex,
  ]);
  const fontName =
    brand.typography?.titleFont?.name ||
    brand.typography?.scale?.display?.large?.fontFamily ||
    brand.typography?.bodyFont?.name;
  const tone = list(
    brand.toneOfVoice?.traits?.map((trait) => trait.name) ?? [],
  );
  const values = list(brand.brandOverview?.values ?? []);
  const visualStyle = list([
    brand.visualElements?.illustrations?.style,
    brand.visualElements?.patterns?.usage,
  ]);

  return [
    `Create a high-end, photorealistic marketing mockup for the brand "${brandName}".`,
    `Scene: ${scenePrompt}`,
    `Aspect: ${aspect === "portrait" ? "vertical" : aspect === "square" ? "square" : "horizontal"} composition.`,
    userPrompt
      ? `User direction: ${userPrompt}`
      : "User direction: premium, modern, and cohesive.",
    palette.length > 0
      ? `Use the brand color palette prominently: ${palette.join(", ")}.`
      : "Use a restrained, modern color palette.",
    fontName ? `Typography vibe: ${fontName}.` : null,
    tone.length > 0 ? `Tone keywords: ${tone.join(", ")}.` : null,
    values.length > 0 ? `Brand values: ${values.join(", ")}.` : null,
    visualStyle.length > 0
      ? `Visual style cues: ${visualStyle.join(", ")}.`
      : null,
    "Include the brand name as a clean wordmark on the key surface. Minimal copy only (brand name + short tagline).",
    "Avoid watermarks, extra logos, or illegible text. Sharp focus, realistic materials, natural lighting.",
  ]
    .filter(Boolean)
    .join("\n");
};

const getSize = (aspect: RequestBody["aspect"]) => {
  switch (aspect) {
    case "portrait":
      return "1024x1536";
    case "square":
      return "1024x1024";
    case "landscape":
    default:
      return "1536x1024";
  }
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const body = (await req.json()) as RequestBody;
    const userPrompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";
    const scene =
      typeof body.scene === "string" && scenePresets[body.scene]
        ? scenePresets[body.scene]
        : scenePresets["product-hero"];
    const aspect =
      body.aspect === "portrait" || body.aspect === "square"
        ? body.aspect
        : "landscape";
    const count =
      typeof body.count === "number"
        ? Math.min(Math.max(Math.round(body.count), 1), 4)
        : 1;
    const brand = body.brand ?? {};

    const prompt = buildPrompt(brand, scene.prompt, userPrompt, aspect);

    const data = await openai.images.generate({
      model: "gpt-image-1.5",
      prompt,
      n: count,
      size: getSize(aspect),
      quality: "high",
    });
    const images =
      data.data
        ?.map((item) => {
          if (item.b64_json) {
            return `data:image/png;base64,${item.b64_json}`;
          }
          if (item.url) return item.url;
          return null;
        })
        .filter((item): item is string => Boolean(item)) ?? [];

    return NextResponse.json(
      {
        images,
        prompt,
        scene: scene.label,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("brand-mockups error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
