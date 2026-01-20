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
    defaultHint: "Example: premium coffee can, skincare serum, smart device launch",
  },
  "packaging-set": {
    label: "Packaging Set",
    prompt:
      "Packaging set on a textured tabletop, overhead softbox lighting, premium print finish, clean shadows.",
    defaultHint: "Example: gift set, sample kit, merch box",
  },
  "product-box": {
    label: "Product Box",
    prompt:
      "Boxed product packaging on a clean surface, sharp edges, premium print finish, soft daylight.",
    defaultHint: "Example: subscription box, limited edition kit",
  },
  "bottle-shot": {
    label: "Bottle Shot",
    prompt:
      "Studio bottle shot with subtle reflections, clean surface, soft gradient background.",
    defaultHint: "Example: beverage bottle, skincare toner",
  },
  "jar-shot": {
    label: "Jar Shot",
    prompt:
      "Cosmetic jar with matte finish, soft shadow, minimal surface texture.",
    defaultHint: "Example: face cream, body balm",
  },
  "coffee-cup": {
    label: "Coffee Cup",
    prompt:
      "Branded paper cup on a cafe counter, warm ambient light, shallow depth of field.",
    defaultHint: "Example: seasonal drink launch",
  },
  "retail-display": {
    label: "Retail Display",
    prompt:
      "Retail shelf display with branded product lineup, tidy merchandising, warm ambient lighting, shallow depth of field.",
    defaultHint: "Example: convenience store shelf, limited edition launch",
  },
  "retail-bag": {
    label: "Retail Bag",
    prompt:
      "Branded shopping bag on a pedestal, soft daylight, subtle shadows, premium materials.",
    defaultHint: "Example: boutique bag, flagship store",
  },
  "store-front": {
    label: "Storefront",
    prompt:
      "Storefront signage on a clean facade, street context, glass reflections, modern typography.",
    defaultHint: "Example: flagship store, pop-up retail",
  },
  "window-decal": {
    label: "Window Decal",
    prompt:
      "Glass storefront window decal with bold wordmark, reflective glass, urban context.",
    defaultHint: "Example: seasonal window campaign",
  },
  "pop-up-booth": {
    label: "Pop-up Booth",
    prompt:
      "Pop-up booth with banners and counters, event space lighting, clean signage.",
    defaultHint: "Example: launch booth, mall activation",
  },
  "trade-show": {
    label: "Trade Show",
    prompt:
      "Trade show booth in expo hall, branded panels, people softly blurred in background.",
    defaultHint: "Example: B2B exhibition",
  },
  "event-stage": {
    label: "Event Stage",
    prompt:
      "Event stage backdrop with lighting rigs, large screen with brand visuals, crowd blur.",
    defaultHint: "Example: keynote, product launch",
  },
  "event-poster": {
    label: "Event Poster",
    prompt:
      "Gallery corridor with framed event posters, soft spotlighting, people walking slightly blurred in background.",
    defaultHint: "Example: pop-up exhibit, brand collaboration event",
  },
  billboard: {
    label: "Billboard",
    prompt:
      "Large outdoor billboard on a highway, daytime sky, realistic structure and lighting.",
    defaultHint: "Example: product launch campaign",
  },
  "billboard-night": {
    label: "Billboard Night",
    prompt:
      "Nighttime billboard with city lights, glowing ad panel, moody urban atmosphere.",
    defaultHint: "Example: evening event campaign",
  },
  "bus-stop": {
    label: "Bus Stop",
    prompt:
      "Urban bus stop shelter with a full-height poster ad, evening city glow, light traffic blur, wet pavement reflections.",
    defaultHint: "Example: event poster, new service launch campaign",
  },
  "subway-platform": {
    label: "Subway Platform",
    prompt:
      "Subway platform posters with motion blur of train, cool lighting, gritty textures.",
    defaultHint: "Example: transit ad campaign",
  },
  "airport-lightbox": {
    label: "Airport Lightbox",
    prompt:
      "Backlit lightbox ad in an airport terminal, clean modern architecture, travelers in motion blur.",
    defaultHint: "Example: premium travel brand",
  },
  "taxi-top": {
    label: "Taxi Top",
    prompt:
      "Taxi roof ad panel on a city street, evening lighting, realistic reflections.",
    defaultHint: "Example: local service campaign",
  },
  "digital-ooh": {
    label: "Digital OOH",
    prompt:
      "Large digital out-of-home screen on a building, city backdrop, vibrant light spill.",
    defaultHint: "Example: dynamic campaign visuals",
  },
  "street-banner": {
    label: "Street Banner",
    prompt:
      "Lamp post street banners lining a boulevard, daylight, soft wind movement.",
    defaultHint: "Example: festival or seasonal campaign",
  },
  "wayfinding-signage": {
    label: "Wayfinding Signage",
    prompt:
      "Wayfinding signage system in a public space, clean typography, directional arrows.",
    defaultHint: "Example: campus or event venue",
  },
  "vehicle-wrap": {
    label: "Vehicle Wrap",
    prompt:
      "Branded van or car wrap on a city street, realistic reflections and body curves.",
    defaultHint: "Example: delivery fleet branding",
  },
  "food-truck": {
    label: "Food Truck",
    prompt:
      "Food truck with full wrap design parked at curb, warm daylight, street context.",
    defaultHint: "Example: street food brand",
  },
  "vending-machine": {
    label: "Vending Machine",
    prompt:
      "Branded vending machine exterior with product visuals, indoor lighting, clean surfaces.",
    defaultHint: "Example: beverage or snack brand",
  },
  "kiosk-screen": {
    label: "Kiosk Screen",
    prompt:
      "Interactive kiosk UI in a retail environment, clean hardware, soft ambient light.",
    defaultHint: "Example: self-service ordering",
  },
  "office-lobby": {
    label: "Office Lobby",
    prompt:
      "Office lobby wall logo with lighting, polished floor reflections, modern interior.",
    defaultHint: "Example: HQ branding",
  },
  "magazine-spread": {
    label: "Magazine Spread",
    prompt:
      "Editorial magazine spread on a tabletop, natural light, soft paper texture.",
    defaultHint: "Example: lifestyle editorial",
  },
  "newspaper-ad": {
    label: "Newspaper Ad",
    prompt:
      "Newspaper ad layout on folded newsprint, classic print texture and ink.",
    defaultHint: "Example: local announcement",
  },
  "business-card": {
    label: "Business Card",
    prompt:
      "Minimal business cards on textured paper, subtle shadows, premium finish.",
    defaultHint: "Example: matte or letterpress",
  },
  "stationery-set": {
    label: "Stationery Set",
    prompt:
      "Stationery set with notebook, pen, and branded paper on a clean desk.",
    defaultHint: "Example: corporate stationery",
  },
  "letterhead": {
    label: "Letterhead",
    prompt:
      "Letterhead on a modern desk, branded header, clean typography, soft light.",
    defaultHint: "Example: formal correspondence",
  },
  "envelope": {
    label: "Envelope",
    prompt:
      "Branded envelope with seal or label, minimal styling, soft shadows.",
    defaultHint: "Example: premium mailer",
  },
  "sticker-pack": {
    label: "Sticker Pack",
    prompt:
      "Die-cut sticker sheet with brand marks, flat lay composition.",
    defaultHint: "Example: promo sticker pack",
  },
  "tote-bag": {
    label: "Tote Bag",
    prompt:
      "Canvas tote bag with bold logo lockup, soft daylight, natural fabric texture.",
    defaultHint: "Example: merch drop",
  },
  "apparel-hanger": {
    label: "Apparel Hanger",
    prompt:
      "T-shirt or hoodie on hanger, clean studio background, branded print.",
    defaultHint: "Example: apparel capsule",
  },
  "merchandise-flatlay": {
    label: "Merch Flatlay",
    prompt:
      "Merch lineup from top-down view, tidy arrangement, soft shadows.",
    defaultHint: "Example: assorted merch items",
  },
  "website-hero": {
    label: "Website Hero",
    prompt:
      "Website hero section on a laptop screen, minimal UI chrome, clean layout.",
    defaultHint: "Example: landing page with bold typography",
  },
  "app-onboarding": {
    label: "App Onboarding",
    prompt:
      "Mobile onboarding screens on a smartphone, soft light, clean UI.",
    defaultHint: "Example: onboarding carousel",
  },
  "app-splash": {
    label: "App Splash",
    prompt:
      "App splash screen on a device, minimal UI, strong logo focus.",
    defaultHint: "Example: startup splash screen",
  },
  "app-store": {
    label: "App Store",
    prompt:
      "App store listing on a phone, hero screenshots and ratings visible.",
    defaultHint: "Example: mobile app launch",
  },
  "email-newsletter": {
    label: "Email Newsletter",
    prompt:
      "Email newsletter layout in a desktop mail client, clean grid and hero image.",
    defaultHint: "Example: product update",
  },
  "presentation-slide": {
    label: "Presentation Slide",
    prompt:
      "Presentation slide on a large screen, bold title, supporting visuals.",
    defaultHint: "Example: keynote slide",
  },
  "pitch-deck-cover": {
    label: "Pitch Deck Cover",
    prompt:
      "Pitch deck cover on a tablet or laptop, strong title and logo.",
    defaultHint: "Example: investor deck",
  },
  "instagram-feed": {
    label: "Instagram Feed",
    prompt:
      "Instagram feed grid on a smartphone, cohesive post visuals.",
    defaultHint: "Example: social feed series",
  },
  "instagram-story": {
    label: "Instagram Story",
    prompt:
      "Instagram story layout on a smartphone, bold typography and CTA.",
    defaultHint: "Example: story announcement",
  },
  "tiktok-thumbnail": {
    label: "TikTok Thumbnail",
    prompt:
      "Short-form video thumbnail on a phone, bold framing and title.",
    defaultHint: "Example: launch teaser",
  },
  "youtube-thumbnail": {
    label: "YouTube Thumbnail",
    prompt:
      "YouTube video thumbnail with bold framing and high-contrast text.",
    defaultHint: "Example: brand campaign video",
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
