"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBrandData } from "../hooks/useBrandData";
import type { BrandType } from "../types";
import {
  ArrowLeft,
  Wand2,
  Download,
  Image as ImageIcon,
  LayoutTemplate,
  Package,
  MonitorPlay,
  Store,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Maximize2,
} from "lucide-react";
import { mockCocaColaBrandType } from "../mockCocaColaBrandType";

type GeneratedImage = {
  id: string;
  url: string;
  scene: string;
  prompt: string;
};

type SceneCategory =
  | "product"
  | "retail"
  | "event"
  | "ooh"
  | "print"
  | "digital"
  | "merch"
  | "workspace";

type SceneCategoryFilter = SceneCategory | "all";

type SceneOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: SceneCategory;
};

const sceneCategories: Array<{ id: SceneCategoryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "product", label: "Product" },
  { id: "retail", label: "Retail" },
  { id: "event", label: "Event" },
  { id: "ooh", label: "OOH" },
  { id: "digital", label: "Digital" },
  { id: "print", label: "Print" },
  { id: "merch", label: "Merch" },
  { id: "workspace", label: "Workspace" },
];

const sceneOptions: SceneOption[] = [
  {
    id: "product-hero",
    label: "Product Hero",
    description: "Studio product hero shot",
    icon: Sparkles,
    category: "product",
  },
  {
    id: "packaging-set",
    label: "Packaging Set",
    description: "Packaging or merch set",
    icon: Package,
    category: "product",
  },
  {
    id: "product-box",
    label: "Product Box",
    description: "Boxed product with clean typography",
    icon: Package,
    category: "product",
  },
  {
    id: "bottle-shot",
    label: "Bottle Shot",
    description: "Glass or PET bottle on a clean surface",
    icon: Package,
    category: "product",
  },
  {
    id: "jar-shot",
    label: "Jar Shot",
    description: "Cosmetic jar with premium texture",
    icon: Package,
    category: "product",
  },
  {
    id: "coffee-cup",
    label: "Coffee Cup",
    description: "Branded hot cup with sleeve and lid",
    icon: Package,
    category: "product",
  },
  {
    id: "retail-display",
    label: "Retail Display",
    description: "Shelf or retail display",
    icon: Store,
    category: "retail",
  },
  {
    id: "retail-bag",
    label: "Retail Bag",
    description: "Shopping bag with bold logo",
    icon: Store,
    category: "retail",
  },
  {
    id: "store-front",
    label: "Storefront",
    description: "Shop facade signage and window styling",
    icon: Store,
    category: "retail",
  },
  {
    id: "window-decal",
    label: "Window Decal",
    description: "Vinyl window graphic on glass",
    icon: LayoutTemplate,
    category: "retail",
  },
  {
    id: "pop-up-booth",
    label: "Pop-up Booth",
    description: "Modular booth with banners and counters",
    icon: Calendar,
    category: "event",
  },
  {
    id: "trade-show",
    label: "Trade Show",
    description: "Exhibition hall booth with panels",
    icon: Calendar,
    category: "event",
  },
  {
    id: "event-stage",
    label: "Event Stage",
    description: "Stage backdrop and lighting scene",
    icon: Calendar,
    category: "event",
  },
  {
    id: "event-poster",
    label: "Event Poster",
    description: "Exhibit or pop-up event",
    icon: Calendar,
    category: "event",
  },
  {
    id: "billboard",
    label: "Billboard",
    description: "Large outdoor billboard daytime",
    icon: Maximize2,
    category: "ooh",
  },
  {
    id: "billboard-night",
    label: "Billboard Night",
    description: "Night billboard with urban glow",
    icon: Maximize2,
    category: "ooh",
  },
  {
    id: "bus-stop",
    label: "Bus Stop",
    description: "Street ad board mockup",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "subway-platform",
    label: "Subway Platform",
    description: "Platform posters with motion blur",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "airport-lightbox",
    label: "Airport Lightbox",
    description: "Backlit ad panel in terminal",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "taxi-top",
    label: "Taxi Top",
    description: "City taxi roof ad panel",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "digital-ooh",
    label: "Digital OOH",
    description: "Large digital out-of-home screen",
    icon: Maximize2,
    category: "ooh",
  },
  {
    id: "street-banner",
    label: "Street Banner",
    description: "Lamp post banner on a main street",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "wayfinding-signage",
    label: "Wayfinding Signage",
    description: "Directional signs in public space",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "vehicle-wrap",
    label: "Vehicle Wrap",
    description: "Branded van or car wrap",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "food-truck",
    label: "Food Truck",
    description: "Mobile truck with full wrap design",
    icon: LayoutTemplate,
    category: "ooh",
  },
  {
    id: "vending-machine",
    label: "Vending Machine",
    description: "Branded vending machine exterior",
    icon: Store,
    category: "retail",
  },
  {
    id: "kiosk-screen",
    label: "Kiosk Screen",
    description: "Interactive kiosk UI in context",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "office-lobby",
    label: "Office Lobby",
    description: "Lobby wall logo with lighting",
    icon: LayoutTemplate,
    category: "workspace",
  },
  {
    id: "magazine-spread",
    label: "Magazine Spread",
    description: "Two-page editorial ad spread",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "newspaper-ad",
    label: "Newspaper Ad",
    description: "Classic print ad layout",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "business-card",
    label: "Business Card",
    description: "Minimal card on textured paper",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "stationery-set",
    label: "Stationery Set",
    description: "Notebook, pen, and branded paper",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "letterhead",
    label: "Letterhead",
    description: "Formal letterhead mockup",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "envelope",
    label: "Envelope",
    description: "Branded envelope and seal",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "sticker-pack",
    label: "Sticker Pack",
    description: "Die-cut sticker set layout",
    icon: ImageIcon,
    category: "print",
  },
  {
    id: "tote-bag",
    label: "Tote Bag",
    description: "Canvas tote with logo lockup",
    icon: ImageIcon,
    category: "merch",
  },
  {
    id: "apparel-hanger",
    label: "Apparel Hanger",
    description: "T-shirt or hoodie on hanger",
    icon: ImageIcon,
    category: "merch",
  },
  {
    id: "merchandise-flatlay",
    label: "Merch Flatlay",
    description: "Merch lineup from top-down view",
    icon: ImageIcon,
    category: "merch",
  },
  {
    id: "website-hero",
    label: "Website Hero",
    description: "Landing page hero in browser frame",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "app-onboarding",
    label: "App Onboarding",
    description: "Mobile onboarding screens",
    icon: Layers,
    category: "digital",
  },
  {
    id: "app-splash",
    label: "App Splash",
    description: "Splash screen on device",
    icon: Layers,
    category: "digital",
  },
  {
    id: "app-store",
    label: "App Store",
    description: "Store listing with screenshots",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "email-newsletter",
    label: "Email Newsletter",
    description: "Email layout with hero image",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "presentation-slide",
    label: "Presentation Slide",
    description: "Keynote slide with brand system",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "pitch-deck-cover",
    label: "Pitch Deck Cover",
    description: "Deck cover with strong title",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "instagram-feed",
    label: "Instagram Feed",
    description: "Grid of social posts",
    icon: Layers,
    category: "digital",
  },
  {
    id: "instagram-story",
    label: "Instagram Story",
    description: "Story layout on mobile",
    icon: Layers,
    category: "digital",
  },
  {
    id: "tiktok-thumbnail",
    label: "TikTok Thumbnail",
    description: "Short-form video cover",
    icon: MonitorPlay,
    category: "digital",
  },
  {
    id: "youtube-thumbnail",
    label: "YouTube Thumbnail",
    description: "Video cover with bold framing",
    icon: MonitorPlay,
    category: "digital",
  },
];

const sceneHintsById: Partial<Record<string, string>> = {
  "product-hero":
    "Single hero product on a minimal plinth, soft daylight, clean shadows.",
  "packaging-set":
    "Top-down packaging set with premium print finishes and subtle texture.",
  "bottle-shot":
    "Glass bottle with gentle reflections on a neutral gradient backdrop.",
  "bus-stop":
    "Urban bus shelter ad at dusk with wet pavement reflections.",
  "billboard":
    "Large-scale billboard in bright daylight with strong contrast.",
  "event-poster":
    "Gallery corridor poster with soft spotlights and foot traffic blur.",
  "website-hero":
    "Browser mockup featuring a bold hero section and minimal UI chrome.",
  "instagram-story":
    "Vertical story layout on a phone with clean typography and CTA.",
};

const sceneHintsByCategory: Record<SceneCategory, string> = {
  product: "Minimal studio setup, premium materials, soft lighting.",
  retail: "Store context with fixtures, signage, and ambient lighting.",
  event: "Venue atmosphere, banners, and stage or poster focus.",
  ooh: "Urban context with large-scale signage and street lighting.",
  print: "Paper texture, top-down flatlay, subtle shadows.",
  digital: "Device mockup, clean UI, high contrast readability.",
  merch: "Fabric texture, natural folds, lifestyle styling.",
  workspace: "Architectural interior, logo wall, polished finishes.",
};

const scenePromptSuggestionsById: Partial<Record<string, string[]>> = {
  "product-hero": [
    "Single hero product on a matte plinth, soft daylight, clean shadows, premium finish.",
    "Minimal studio setup with subtle reflections, focus on material texture and logo.",
  ],
  "coffee-cup": [
    "Matte black coffee cup with embossed logo, latte art visible, warm cafe lighting.",
    "Paper cup with kraft sleeve, cozy morning light, shallow depth of field.",
  ],
  "bus-stop": [
    "Full-height poster ad in a bus shelter at dusk, wet pavement reflections.",
    "City street shelter with branded campaign, soft traffic blur, neon accents.",
  ],
  "billboard": [
    "Highway billboard under bright blue sky, bold typography with minimal copy.",
    "Large outdoor billboard with strong contrast, clean logo placement.",
  ],
  "event-poster": [
    "Gallery corridor poster with spotlighting, slight motion blur of visitors.",
    "Event poster on a concrete wall, soft ambient lighting, clean layout.",
  ],
  "website-hero": [
    "Landing page hero on a laptop mockup, bold headline and product visual.",
    "Minimal website hero with strong color blocks and clear CTA.",
  ],
  "instagram-story": [
    "Vertical story layout with bold typography, product close-up, and CTA.",
    "Story template with gradient overlay, minimal copy, centered logo.",
  ],
};

const scenePromptSuggestionsByCategory: Record<SceneCategory, string[]> = {
  product: [
    "Premium product close-up on a clean surface, soft daylight, crisp shadows.",
    "Minimal studio setup with subtle reflections and brand mark focus.",
  ],
  retail: [
    "Store shelf scene with tidy merchandising and branded signage.",
    "Boutique storefront with glass reflections and clean logo placement.",
  ],
  event: [
    "Event space with banners and stage lighting, crowd softly blurred.",
    "Poster display in a gallery-like corridor with soft spotlights.",
  ],
  ooh: [
    "Urban street context with large-scale signage and ambient city lights.",
    "Transit ad with motion blur, bold brand mark, and minimal copy.",
  ],
  print: [
    "Top-down flatlay on textured paper, clean typography and soft shadows.",
    "Editorial print style with subtle grain and elegant layout.",
  ],
  digital: [
    "Device mockup with clean UI, strong hierarchy, and minimal copy.",
    "High-contrast screen layout with bold headline and clear CTA.",
  ],
  merch: [
    "Fabric texture in natural light, logo lockup centered.",
    "Lifestyle merch flatlay with soft shadows and muted props.",
  ],
  workspace: [
    "Modern interior with logo wall and polished finishes, soft lighting.",
    "Lobby branding scene with architectural lighting and reflections.",
  ],
};

const sceneGroups: Record<SceneCategory, SceneOption[]> = {
  product: [],
  retail: [],
  event: [],
  ooh: [],
  print: [],
  digital: [],
  merch: [],
  workspace: [],
};

for (const option of sceneOptions) {
  sceneGroups[option.category].push(option);
}

const aspectOptions = [
  { id: "landscape", label: "Landscape", hint: "1536x1024", icon: MonitorPlay },
  { id: "portrait", label: "Portrait", hint: "1024x1536", icon: Layers },
  { id: "square", label: "Square", hint: "1024x1024", icon: ImageIcon },
];

const quickIdeas = [
  "Premium coffee can",
  "Skincare serum",
  "Smart device launch",
  "Pop-up exhibit event",
  "Urban bus stop campaign",
  "Gift set packaging",
];

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function BrandMockupsPage() {
  const [brandData, setBrandData] = useState<BrandType>(mockCocaColaBrandType);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scene, setScene] = useState(sceneOptions[0].id);
  const [sceneCategory, setSceneCategory] =
    useState<SceneCategoryFilter>("all");
  const [aspect, setAspect] = useState<"landscape" | "portrait" | "square">(
    "landscape",
  );
  const [count, setCount] = useState(1);
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [lastPrompt, setLastPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("generatedBrandType");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as BrandType;
        setBrandData(parsed);
      } catch {
        setBrandData(mockCocaColaBrandType);
      }
    }
    setIsLoaded(true);
  }, []);

  const { mergedData } = useBrandData(brandData);

  const brandPalette = useMemo(() => {
    return {
      primary: mergedData.color.brand.primary.hex,
      secondary: mergedData.color.brand.secondary.hex,
      accent: mergedData.color.brand.accent.hex,
    };
  }, [mergedData]);

  const brandFont =
    mergedData.typography.titleFont?.name ??
    mergedData.typography.scale.display.large.fontFamily ??
    "Space Grotesk";

  const themeVars: CSSProperties = {
    "--brand-primary": brandPalette.primary,
    "--brand-secondary": brandPalette.secondary,
    "--brand-accent": brandPalette.accent,
    "--brand-font": brandFont,
  } as CSSProperties;

  const backgroundStyle: CSSProperties = useMemo(
    () => ({
      background: `
        radial-gradient(circle at 12% 18%, ${hexToRgba(
          brandPalette.primary,
          0.08,
        )} 0%, transparent 45%),
        radial-gradient(circle at 86% 12%, ${hexToRgba(
          brandPalette.accent,
          0.12,
        )} 0%, transparent 55%),
        radial-gradient(circle at 40% 85%, ${hexToRgba(
          brandPalette.secondary,
          0.08,
        )} 0%, transparent 52%),
        #ffffff
      `,
    }),
    [brandPalette],
  );

  const sceneOption = useMemo(
    () => sceneOptions.find((option) => option.id === scene),
    [scene],
  );

  const scenePreview = useMemo(() => {
    if (!sceneOption) return null;
    return {
      title: sceneOption.label,
      hint:
        sceneHintsById[sceneOption.id] ??
        sceneHintsByCategory[sceneOption.category],
    };
  }, [sceneOption]);

  const sceneSuggestions = useMemo(() => {
    if (!sceneOption) return [];
    const byId = scenePromptSuggestionsById[sceneOption.id];
    if (byId && byId.length > 0) return byId;
    return scenePromptSuggestionsByCategory[sceneOption.category] ?? [];
  }, [sceneOption]);

  const renderSceneButton = (option: SceneOption) => {
    const Icon = option.icon;
    const isActive = scene === option.id;
    return (
      <button
        key={option.id}
        onClick={() => setScene(option.id)}
        className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200 ${
          isActive
            ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5 shadow-md ring-1 ring-[color:var(--brand-primary)]"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            isActive
              ? "text-[color:var(--brand-primary)]"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        <div>
          <div
            className={`text-xs font-semibold ${
              isActive ? "text-[color:var(--brand-primary)]" : "text-slate-700"
            }`}
          >
            {option.label}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
            {option.description}
          </div>
        </div>
      </button>
    );
  };

  const getCategoryCount = (categoryId: SceneCategoryFilter) => {
    if (categoryId === "all") return sceneOptions.length;
    return sceneGroups[categoryId].length;
  };

  const filteredScenes =
    sceneCategory === "all" ? [] : sceneGroups[sceneCategory];

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/brand-mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: {
            meta: { brandName: mergedData.meta.brandName },
            color: {
              brand: {
                primary: { hex: brandPalette.primary },
                secondary: { hex: brandPalette.secondary },
                accent: { hex: brandPalette.accent },
              },
            },
            typography: {
              titleFont: mergedData.typography.titleFont,
              bodyFont: mergedData.typography.bodyFont,
              scale: {
                display: {
                  large: {
                    fontFamily:
                      mergedData.typography.scale.display.large.fontFamily,
                  },
                },
              },
            },
            brandOverview: mergedData.brandOverview,
            toneOfVoice: mergedData.toneOfVoice,
            visualElements: mergedData.visualElements,
          },
          prompt: query,
          scene,
          aspect,
          count,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Image generation failed.");
      }

      const nextImages: GeneratedImage[] = (data.images ?? []).map(
        (url: string) => ({
          id: crypto.randomUUID(),
          url,
          scene: data.scene ?? scene,
          prompt: data.prompt ?? "",
        }),
      );

      setImages((prev) => [...nextImages, ...prev]);
      setLastPrompt(data.prompt ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${mergedData.meta.brandName}-mockup-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden text-slate-900 md:flex-row"
      style={{ ...themeVars, ...backgroundStyle }}
    >
      {/* Decorative Blur Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-20 top-16 h-96 w-96 rounded-full bg-[color:var(--brand-primary)] opacity-[0.03] blur-3xl" />
        <div className="absolute -right-24 bottom-24 h-[500px] w-[500px] rounded-full bg-[color:var(--brand-secondary)] opacity-[0.03] blur-3xl" />
      </div>

      {/* Sidebar Controls */}
      <aside className="relative z-10 flex w-full flex-col border-b border-slate-200/60 bg-white/60 px-6 py-6 backdrop-blur-2xl md:h-screen md:w-[400px] md:shrink-0 md:border-r md:border-b-0 md:overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/brand"
            className="group flex items-center gap-2 rounded-lg py-1 pr-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:border-slate-300">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Mockup Studio
          </div>
        </div>

        <div className="space-y-8">
          {/* Brand Identity Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--brand-primary)]/20 bg-[color:var(--brand-primary)]/5 p-5">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--brand-primary)] opacity-70">
                Active Brand
              </p>
              <h2
                className="mt-1 text-xl font-bold text-slate-900"
                style={{ fontFamily: "var(--brand-font)" }}
              >
                {mergedData.meta.brandName}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                {mergedData.brandOverview?.mission ||
                  "Visualizing the future of this brand."}
              </p>
              <div className="mt-4 flex gap-1.5">
                {[
                  brandPalette.primary,
                  brandPalette.secondary,
                  brandPalette.accent,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full border border-white/40 shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[color:var(--brand-primary)] opacity-[0.07] blur-2xl" />
          </div>

          <div className="space-y-1">
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "var(--brand-font)" }}
            >
              Create Scene
            </h1>
            <p className="text-sm text-slate-500">
              Generate photorealistic mockups grounded in your brand identity.
            </p>
          </div>

          {/* Scene Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Scene Type
            </label>
            <div className="flex flex-wrap gap-2">
              {sceneCategories.map((category) => {
                const isActive = sceneCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSceneCategory(category.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${
                      isActive
                        ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)] text-white shadow-sm shadow-[color:var(--brand-primary)]/20"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {getCategoryCount(category.id)}
                    </span>
                  </button>
                );
              })}
            </div>
            {sceneCategory === "all" ? (
              <div className="space-y-4">
                {sceneCategories
                  .filter((category) => category.id !== "all")
                  .map((category) => {
                    const scenes =
                      category.id === "all" ? [] : sceneGroups[category.id];
                    if (scenes.length === 0) return null;
                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {category.label}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {scenes.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {scenes.map((option) => renderSceneButton(option))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredScenes.map((option) => renderSceneButton(option))}
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Prompt Detail
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your product... e.g. 'Minimalist serum bottle on a stone podium'"
                className="w-full h-32 resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] shadow-sm"
              />
              <div className="absolute bottom-2 right-2">
                <Wand2 className="h-4 w-4 text-slate-300" />
              </div>
            </div>
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickIdeas.slice(0, 4).map((idea) => (
                <button
                  key={idea}
                  onClick={() => setQuery((p) => (p ? `${p}, ${idea}` : idea))}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
                >
                  + {idea}
                </button>
              ))}
            </div>
            {scenePreview && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Scene Preview
                </p>
                <p className="mt-2 font-semibold text-slate-700">
                  {scenePreview.title}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {scenePreview.hint}
                </p>
              </div>
            )}
            {sceneSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Suggested Prompts
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sceneSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() =>
                        setQuery((prev) =>
                          prev ? `${prev}, ${suggestion}` : suggestion,
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white p-2 text-left text-[11px] text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Aspect & Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Format
              </label>
              <div className="flex flex-col gap-1.5">
                {aspectOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAspect(opt.id as any)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                        aspect === opt.id
                          ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5 text-[color:var(--brand-primary)] font-medium"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Batch Size
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`h-9 w-9 rounded-lg border text-sm font-medium transition ${
                      count === num
                        ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)] text-white shadow-md shadow-[color:var(--brand-primary)]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Credits: {count}
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !query}
              className="group relative w-full overflow-hidden rounded-xl bg-[color:var(--brand-primary)] px-4 py-4 text-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[color:var(--brand-primary)]/20 transition hover:shadow-[color:var(--brand-primary)]/30 active:scale-[0.99]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dreaming...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition group-hover:animate-[shimmer_1s_infinite]" />
            </button>
            {error && (
              <p className="mt-2 text-center text-xs text-rose-500">{error}</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Gallery Area */}
      <section className="relative flex-1 overflow-y-auto bg-slate-50/50 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gallery</h2>
              <p className="text-sm text-slate-500 mt-1">
                {images.length === 0
                  ? "Your generated creations will appear here."
                  : `Showing ${images.length} generated mockups.`}
              </p>
            </div>

            {/* Brand Pill */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-1.5 pr-3 py-1 shadow-sm">
                <div className="flex -space-x-1.5">
                  {[
                    brandPalette.primary,
                    brandPalette.secondary,
                    brandPalette.accent,
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full border border-white"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {mergedData.meta.brandName}
                </span>
              </div>
            </div>
          </header>

          {/* Gallery Grid */}
          {images.length === 0 ? (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                <ImageIcon className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-900">
                No mockups yet
              </p>
              <p className="text-slate-500 text-sm max-w-xs mt-1">
                Select a scene, type a prompt, and hit generate to see magic
                happens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image, idx) => (
                <div
                  key={image.id}
                  className="motion-fade-up group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Image */}
                  <img
                    src={image.url}
                    alt="Mockup"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                            {sceneOptions.find((opt) => opt.id === image.scene)
                              ?.label || "Custom"}
                          </span>
                        </div>
                        <button
                          onClick={() => downloadImage(image.url, idx)}
                          className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      {image.prompt && (
                        <p className="mt-2 line-clamp-2 text-xs text-white/90">
                          {image.prompt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
