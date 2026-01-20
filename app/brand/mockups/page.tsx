"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBrandData } from "../hooks/useBrandData";
import { mockBrandType } from "../mockBrandType";
import type { BrandType } from "../types";

type GeneratedImage = {
  id: string;
  url: string;
  scene: string;
  prompt: string;
};

const sceneOptions = [
  {
    id: "product-hero",
    label: "Product Hero",
    description: "Studio product hero shot, premium mood",
  },
  {
    id: "bus-stop",
    label: "Bus Stop Campaign",
    description: "Street ad board or shelter mockup",
  },
  {
    id: "event-poster",
    label: "Event Poster",
    description: "Exhibit or pop-up event poster",
  },
  {
    id: "retail-display",
    label: "Retail Display",
    description: "Shelf or retail display mockup",
  },
  {
    id: "packaging-set",
    label: "Packaging Set",
    description: "Packaging or merch set shot",
  },
];

const aspectOptions = [
  { id: "landscape", label: "Landscape", hint: "1536x1024" },
  { id: "portrait", label: "Portrait", hint: "1024x1536" },
  { id: "square", label: "Square", hint: "1024x1024" },
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
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function BrandMockupsPage() {
  const [brandData, setBrandData] = useState<BrandType>(mockBrandType);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scene, setScene] = useState(sceneOptions[0].id);
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
        setBrandData(mockBrandType);
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
      background: `radial-gradient(circle at 12% 18%, ${hexToRgba(brandPalette.primary, 0.18)} 0%, transparent 45%), radial-gradient(circle at 86% 12%, ${hexToRgba(brandPalette.accent, 0.22)} 0%, transparent 55%), radial-gradient(circle at 40% 85%, ${hexToRgba(brandPalette.secondary, 0.18)} 0%, transparent 52%), linear-gradient(160deg, #f8fafc 0%, #eef2f6 48%, #ffffff 100%)`,
    }),
    [brandPalette],
  );

  const toneTraits =
    mergedData.toneOfVoice?.traits?.map((trait) => trait.name) ?? [];

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

      setImages(nextImages);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-sm text-slate-500">
          Loading brand workspace...
        </div>
      </div>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-10 text-slate-900 sm:px-6 lg:px-10"
      style={{ ...themeVars, ...backgroundStyle }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.55),_transparent_65%)] blur-2xl" />
        <div className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.6),_transparent_65%)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="motion-fade-up flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">
              Brand Mockup Studio
            </p>
            <h1
              className="text-balance text-3xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--brand-font)" }}
            >
              {mergedData.meta.brandName} Mockup Studio
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Generate product, spatial, and campaign mockups grounded in your
              brand identity. Keep color, tone, and typography consistent with a
              realistic photo feel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/brand"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Brand Guide
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-600">
              v{mergedData.meta.version}
            </span>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]">
          <div
            className="motion-fade-up flex flex-col gap-6"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Scene Builder
                </p>
                <span className="text-xs text-slate-500">
                  {sceneOptions.find((option) => option.id === scene)?.label}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sceneOptions.map((option) => {
                  const isActive = scene === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setScene(option.id)}
                      style={
                        isActive
                          ? {
                              backgroundColor: hexToRgba(
                                brandPalette.primary,
                                0.12,
                              ),
                            }
                          : undefined
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-[color:var(--brand-primary)]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {option.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Describe your product or campaign
                </label>
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Example: Launching an eco-conscious skincare line with a minimalist, premium vibe."
                  className="mt-3 min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickIdeas.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() =>
                        setQuery((prev) => (prev ? `${prev}, ${idea}` : idea))
                      }
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Aspect Ratio
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {aspectOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setAspect(
                            option.id as "landscape" | "portrait" | "square",
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          aspect === option.id
                            ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {aspectOptions.find((option) => option.id === aspect)?.hint}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Images
                  </p>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCount(value)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          count === value
                            ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {value} image
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Generate multiple variations in one run.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? "Generating..." : "Generate Mockup"}
                </button>
                {error && (
                  <span className="text-xs text-rose-500">{error}</span>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Brand Snapshot
              </p>
              <div className="mt-4 grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {mergedData.meta.brandName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {mergedData.brandOverview?.mission ||
                        "Add a mission statement to enrich the output."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      brandPalette.primary,
                      brandPalette.secondary,
                      brandPalette.accent,
                    ].map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full border border-white shadow"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p>
                    <span className="text-slate-400">Tone</span>{" "}
                    {toneTraits.length > 0
                      ? toneTraits.join(" / ")
                      : "Add tone-of-voice traits."}
                  </p>
                  <p className="mt-2">
                    <span className="text-slate-400">Typography</span>{" "}
                    {brandFont}
                  </p>
                  <p className="mt-2">
                    <span className="text-slate-400">Values</span>{" "}
                    {mergedData.brandOverview?.values?.join(" / ") ||
                      "Add brand values for stronger direction."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="text-slate-400">Recommended cues</p>
                  <p className="mt-2">
                    {[
                      mergedData.brandOverview?.vision,
                      mergedData.brandOverview?.mission,
                    ]
                      .filter(Boolean)
                      .join(" / ") || "Add a vision or mission statement."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="motion-fade-up flex flex-col gap-6"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Generated Gallery
                </p>
                {images.length > 0 && (
                  <span className="text-xs text-slate-500">
                    {images.length} image(s)
                  </span>
                )}
              </div>

              {images.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                  Generated mockups will appear here.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <img
                        src={image.url}
                        alt={`${mergedData.meta.brandName} mockup ${index + 1}`}
                        className="h-56 w-full object-cover"
                      />
                      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-600">
                        <span>{image.scene}</span>
                        <button
                          type="button"
                          onClick={() => downloadImage(image.url, index)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Prompt Trace
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {lastPrompt
                  ? "This is the prompt used for the latest generation. Copy or tweak it as needed."
                  : "The prompt will appear after the first generation."}
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                {lastPrompt || "—"}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
