"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useState, useRef } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { BrandNavigation } from "./components/BrandNavigation";
import { PropertyInspector } from "./components/PropertyInspector";
import { BrandOverviewSection } from "./components/sections/BrandOverviewSection";
import { SectionWrapper } from "./components/sections/SectionWrapper";
import { ToneOfVoiceSection } from "./components/sections/ToneOfVoiceSection";
import {
	BrandEditorProvider,
	useBrandEditor,
} from "./context/BrandEditorContext";
import LogoSection from "./LogoSection";
import type { BrandType, ThemeColors } from "./types";

const formatDate = (value: string) => {
	try {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	} catch {
		return value;
	}
};

type Overrides = {
	primary?: string;
	secondary?: string;
	accent?: string;
	fontFamily?: string;
};

const buildTheme = (data: BrandType, overrides: Overrides): ThemeColors => ({
	light: data.color.lightTheme,
	dark: data.color.darkTheme,
	brand: {
		primary: overrides.primary ?? data.color.brand.primary.hex,
		secondary: overrides.secondary ?? data.color.brand.secondary.hex,
		accent: overrides.accent ?? data.color.brand.accent.hex,
	},
});

const hexToRgba = (hex: string, alpha: number) => {
	const normalized = hex.replace("#", "");
	if (normalized.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function BrandGuideClientInner() {
	const editor = useBrandEditor();
	const data = editor.mergedData;
	const { brandName, version, createdAt } = data.meta;
	const { logo, color, typography } = data;
	const [activeSection, setActiveSection] = useState("overview");

	// Refs for scroll handling
	const sectionRefs = {
		overview: useRef<HTMLElement>(null),
		logo: useRef<HTMLElement>(null),
		"brand-overview": useRef<HTMLElement>(null),
		"tone-of-voice": useRef<HTMLElement>(null),
		typography: useRef<HTMLElement>(null),
		colors: useRef<HTMLElement>(null),
		templates: useRef<HTMLElement>(null),
	};

	const scrollToSection = (sectionId: string) => {
		setActiveSection(sectionId);
		const element = sectionRefs[sectionId as keyof typeof sectionRefs]?.current;
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const [overrides, setOverrides] = useState<Overrides>({});
	const theme = useMemo(() => buildTheme(data, overrides), [data, overrides]);

	const themeVars: CSSProperties = {
		"--bg-primary": "rgba(255, 255, 255, 0.7)",
		"--bg-secondary": "rgba(255, 255, 255, 0.4)",
		"--bg-tertiary": "rgba(248, 250, 252, 0.5)",
		"--fg-primary": "#0f172a",
		"--fg-secondary": "#475569",
		"--fg-muted": "#94a3b8",
		"--border-default": "rgba(226, 232, 240, 0.8)",
		"--border-muted": "rgba(226, 232, 240, 0.4)",
		"--brand-primary": theme.brand.primary,
		"--brand-secondary": theme.brand.secondary,
		"--brand-accent": theme.brand.accent,
		"--brand-font":
			overrides.fontFamily ?? typography.scale.display.large.fontFamily,
	} as CSSProperties;

	const pageBackground = `
		radial-gradient(circle at 12% 18%, ${hexToRgba(
			theme.brand.primary,
			0.08,
		)} 0%, transparent 45%),
		radial-gradient(circle at 86% 12%, ${hexToRgba(
			theme.brand.accent,
			0.12,
		)} 0%, transparent 55%),
		radial-gradient(circle at 40% 85%, ${hexToRgba(
			theme.brand.secondary,
			0.08,
		)} 0%, transparent 52%),
		linear-gradient(160deg, #f8fafc 0%, #eef2f6 48%, #ffffff 100%)
	`;

	const cardStyle: CSSProperties = {
		backgroundColor: "var(--bg-primary)",
		borderColor: "var(--border-default)",
		backdropFilter: "blur(12px)",
		WebkitBackdropFilter: "blur(12px)",
	};

	const mutedCardStyle: CSSProperties = {
		backgroundColor: "var(--bg-secondary)",
		borderColor: "var(--border-muted)",
	};

	const handleDownloadJson = useCallback(() => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${brandName}-type.json`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}, [data, brandName]);

	return (
		<main
			className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900"
			style={{
				...themeVars,
				background: pageBackground,
				fontFamily: "var(--brand-font)",
			}}
		>
			{/* Left Navigation */}
			<BrandNavigation
				brandData={data}
				activeSection={activeSection}
				onSectionClick={scrollToSection}
				onExport={() => window.print()}
				onDownloadJson={handleDownloadJson}
			/>

			{/* Center Content Area */}
			<div className="flex-1 overflow-y-auto scroll-smooth">
				<div className="mx-auto max-w-5xl px-8 py-12 pb-32">
					{/* Hero Section */}
					<header ref={sectionRefs.overview} className="mb-20 pt-10">
						<div className="motion-fade-up">
							<div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-primary)]/20 bg-[color:var(--brand-primary)]/5 px-3 py-1 text-xs font-medium text-[color:var(--brand-primary)]">
								<span>Last updated {formatDate(createdAt)}</span>
							</div>
							<h1 className="mt-6 text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
								{brandName}
							</h1>
							<p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
								The definitive guide to our visual language. Using these
								principles ensures consistency and builds trust across every
								touchpoint.
							</p>
						</div>
					</header>

					<div className="flex flex-col gap-10">
						{/* Logo Section */}
						<section ref={sectionRefs.logo} className="scroll-mt-10">
							<LogoSection logo={logo} theme={theme} />
						</section>

						{/* Brand Overview */}
						<section
							ref={sectionRefs["brand-overview"]}
							className="scroll-mt-10"
						>
							{data.brandOverview && (
								<BrandOverviewSection
									data={data.brandOverview}
									cardStyle={cardStyle}
									mutedCardStyle={mutedCardStyle}
								/>
							)}
						</section>

						{/* Tone of Voice */}
						<section
							ref={sectionRefs["tone-of-voice"]}
							className="scroll-mt-10"
						>
							{data.toneOfVoice && (
								<ToneOfVoiceSection
									data={data.toneOfVoice}
									cardStyle={cardStyle}
									mutedCardStyle={mutedCardStyle}
								/>
							)}
						</section>

						{/* Typography */}
						<section ref={sectionRefs.typography} className="scroll-mt-10">
							<div
								className="motion-fade-up grid w-full gap-3 border p-8 shadow-xl shadow-slate-200/40 rounded-3xl"
								style={cardStyle}
							>
								<div className="space-y-4">
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">
										Typography
									</p>
									<h3 className="text-3xl font-bold text-slate-900">
										Live Copy Preview
									</h3>
									<p className="text-sm text-slate-600">
										A direct rendering of type hierarchy and voice.
									</p>
								</div>
								<div className="mt-4 space-y-5">
									<div className="rounded-2xl border p-6" style={cardStyle}>
										<p className="text-xs uppercase tracking-[0.2em] text-slate-400">
											Display
										</p>
										<p
											className="mt-4"
											style={{
												fontSize: typography.scale.display.large.fontSize,
												lineHeight: typography.scale.display.large.lineHeight,
												fontWeight: typography.scale.display.large.fontWeight,
												color: "var(--fg-primary)",
											}}
										>
											The way you speak, the way you prototype.
										</p>
									</div>
									<div
										className="rounded-2xl border p-6"
										style={mutedCardStyle}
									>
										<p className="text-xs uppercase tracking-[0.2em] text-slate-400">
											Hierarchy
										</p>
										<div className="mt-4 space-y-3">
											<div>
												<p
													style={{
														fontSize: typography.scale.heading.h1.fontSize,
														lineHeight: typography.scale.heading.h1.lineHeight,
														fontWeight: typography.scale.heading.h1.fontWeight,
														color: "var(--fg-primary)",
													}}
												>
													Headline: Brand clarity
												</p>
												<p className="mt-2 text-sm text-slate-600">
													Subheadline: Principles in motion
												</p>
											</div>
											<p className="text-sm text-slate-600">
												Body copy: The identity system keeps the experience
												consistent across channels while letting teams move
												fast.
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* Colors */}
						<section ref={sectionRefs.colors} className="scroll-mt-10">
							<div
								className="motion-fade-up grid w-full gap-3 border p-8 shadow-xl shadow-slate-200/40 rounded-3xl"
								style={cardStyle}
							>
								<div className="space-y-4">
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">
										Color Palette
									</p>
									<h3 className="text-3xl font-bold text-slate-900">
										Primary, Secondary, Accent
									</h3>
									<p className="text-sm text-slate-600">
										Our core colors that define the visual weight.
									</p>
								</div>

								<div className="mt-4 grid gap-4 sm:grid-cols-3">
									{[
										{
											...color.brand.primary,
											hex: theme.brand.primary,
											path: "color.brand.primary.hex",
										},
										{
											...color.brand.secondary,
											hex: theme.brand.secondary,
											path: "color.brand.secondary.hex",
										},
										{
											...color.brand.accent,
											hex: theme.brand.accent,
											path: "color.brand.accent.hex",
										},
									].map((swatch) => (
										<SectionWrapper
											key={swatch.name}
											path={swatch.path}
											editable={true}
											className="group rounded-2xl border bg-white p-4 transition-all hover:shadow-lg"
										>
											<div
												className="h-32 rounded-xl shadow-inner transition-transform group-hover:scale-[1.02]"
												style={{ backgroundColor: swatch.hex }}
											/>
											<div className="mt-4">
												<p className="font-bold text-slate-900">
													{swatch.name}
												</p>
												<p className="text-xs uppercase tracking-wider text-slate-400">
													{swatch.hex}
												</p>
											</div>
										</SectionWrapper>
									))}
								</div>
							</div>
						</section>

						{/* Templates */}
						<section ref={sectionRefs.templates} className="scroll-mt-10">
							<div
								className="motion-fade-up grid w-full gap-3 border p-8 shadow-xl shadow-slate-200/40 rounded-3xl"
								style={cardStyle}
							>
								<p className="text-xs uppercase tracking-[0.3em] text-slate-400">
									Templates
								</p>
								<h3 className="text-3xl font-bold text-slate-900">
									Design Resources
								</h3>
								<div className="mt-4 rounded-2xl border p-6 bg-slate-50/50">
									<p className="text-sm text-slate-500 text-center py-8">
										Downloadable assets and templates coming soon.
									</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>

			{/* Right Chat Sidebar */}
			<ChatSidebar />

			{/* Property Inspector */}
			{editor.inspector.isOpen && <PropertyInspector />}
		</main>
	);
}

export default function BrandGuideClient({ data }: { data: BrandType }) {
	return (
		<BrandEditorProvider initialData={data}>
			<BrandGuideClientInner />
		</BrandEditorProvider>
	);
}
