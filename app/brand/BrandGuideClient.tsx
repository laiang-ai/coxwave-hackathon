"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AIChat } from "./components/AIChat";
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
		// Use a consistent format to avoid hydration mismatch
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;

		// Use UTC to ensure consistent server/client rendering
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

// Inner component that uses the context
function BrandGuideClientInner() {
	const editor = useBrandEditor();
	const data = editor.mergedData;

	const { brandName, version, createdAt } = data.meta;
	const { logo, color, typography } = data;

	// Legacy state for backward compatibility with current UI
	const [overrides, setOverrides] = useState<Overrides>({});

	const theme = useMemo(() => buildTheme(data, overrides), [data, overrides]);

	const themeVars: CSSProperties = {
		"--bg-primary": color.lightTheme.background.primary,
		"--bg-secondary": color.lightTheme.background.secondary,
		"--bg-tertiary": color.lightTheme.background.tertiary,
		"--fg-primary": color.lightTheme.foreground.primary,
		"--fg-secondary": color.lightTheme.foreground.secondary,
		"--fg-muted": color.lightTheme.foreground.muted,
		"--border-default": color.lightTheme.border.default,
		"--border-muted": color.lightTheme.border.muted,
		"--brand-primary": theme.brand.primary,
		"--brand-secondary": theme.brand.secondary,
		"--brand-accent": theme.brand.accent,
		"--dark-bg-primary": color.darkTheme.background.primary,
		"--dark-bg-secondary": color.darkTheme.background.secondary,
		"--dark-fg-primary": color.darkTheme.foreground.primary,
		"--dark-fg-secondary": color.darkTheme.foreground.secondary,
		"--dark-border-default": color.darkTheme.border.default,
		"--brand-font":
			overrides.fontFamily ?? typography.scale.display.large.fontFamily,
	} as CSSProperties;

	const pageBackground = `radial-gradient(circle at 12% 18%, ${color.lightTheme.background.primary} 0%, ${color.lightTheme.background.secondary} 55%), radial-gradient(circle at 85% 8%, ${color.brand.primary.scale["50"]} 0%, transparent 48%), radial-gradient(circle at 50% 100%, ${color.brand.secondary.scale["50"]} 0%, ${color.lightTheme.background.tertiary} 55%)`;

	const cardStyle: CSSProperties = {
		backgroundColor: "var(--bg-primary)",
		borderColor: "var(--border-default)",
	};

	const mutedCardStyle: CSSProperties = {
		backgroundColor: "var(--bg-secondary)",
		borderColor: "var(--border-default)",
	};


	const handleExport = useCallback(() => {
		if (typeof window === "undefined") return;
		window.print();
	}, []);

	const handleAIChat = useCallback(async (message: string) => {
		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content: `브랜드 데이터 수정 요청: ${message}\n\n현재 브랜드 데이터:\n${JSON.stringify(data, null, 2)}`,
						},
					],
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");

			const reader = response.body?.getReader();
			if (!reader) return;

			const decoder = new TextDecoder();
			let fullResponse = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n").filter((line) => line.trim());

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const json = JSON.parse(line.slice(6));
							if (json.content) {
								fullResponse += json.content;
							}
						} catch (e) {
							// Ignore parse errors
						}
					}
				}
			}

			// Parse AI response to extract property updates
			// Look for patterns like: "path: color.brand.primary.hex, value: #FF5733"
			const pathMatch = fullResponse.match(/path[:\s]+([^\s,]+)/i);
			const valueMatch = fullResponse.match(/value[:\s]+([^\s,]+)/i);

			if (pathMatch && valueMatch) {
				const path = pathMatch[1];
				const value = valueMatch[1];
				editor.applyUpdate(path, value);
			}
		} catch (error) {
			console.error("AI chat error:", error);
		}
	}, [data, editor]);

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
			className="min-h-screen pb-32 text-[color:var(--fg-primary)]"
			style={{
				...themeVars,
				background: pageBackground,
				fontFamily: "var(--brand-font)",
			}}
		>
			<header className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-8 pt-12">
				<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--fg-muted)]">
					{formatDate(createdAt)}
				</p>
				<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
					{brandName}
				</h1>
				<p className="max-w-xl text-base text-[color:var(--fg-secondary)]">
					Brand Identity Guidelines · Exhibition Edition · v{version}
				</p>
				<div className="no-print mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
					<button
						type="button"
						className="border px-4 py-2"
						style={cardStyle}
						onClick={handleExport}
					>
						Export PDF
					</button>
					<button
						type="button"
						className="border px-4 py-2"
						style={cardStyle}
						onClick={handleDownloadJson}
					>
						Download JSON
					</button>
					<Link
						href="/brand/mockups"
						className="border px-4 py-2"
						style={cardStyle}
					>
						Mockup Studio
					</Link>
					<div
						className="flex items-center gap-2 border px-4 py-2"
						style={cardStyle}
					>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.primary }}
						/>
						<span>Primary</span>
					</div>
					<div
						className="flex items-center gap-2 border px-4 py-2"
						style={cardStyle}
					>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.secondary }}
						/>
						<span>Secondary</span>
					</div>
					<div
						className="flex items-center gap-2 border px-4 py-2"
						style={cardStyle}
					>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.accent }}
						/>
						<span>Accent</span>
					</div>
				</div>
			</header>

			<div className="flex flex-col gap-3">
				<section className="snap-start">
					<div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4 py-6">
						<div
							className="motion-fade-up w-full max-w-5xl border px-8 py-12 text-center shadow-[0_30px_120px_rgba(15,23,42,0.12)]"
							style={cardStyle}
						>
							<p className="text-xs uppercase tracking-[0.35em] text-[color:var(--fg-muted)]">
								{formatDate(createdAt)}
							</p>
							<h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
								{brandName}
							</h2>
							<p className="mt-2 text-base text-[color:var(--fg-secondary)]">
								Brand Identity Guidelines
							</p>
							<p className="mt-6 text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
								Exhibition Format
							</p>
						</div>
					</div>
				</section>

				<LogoSection logo={logo} theme={theme} />

				{/* NEW: Brand Overview Section */}
				{data.brandOverview && (
					<BrandOverviewSection
						data={data.brandOverview}
						cardStyle={cardStyle}
						mutedCardStyle={mutedCardStyle}
					/>
				)}

				{/* NEW: Tone of Voice Section */}
				{data.toneOfVoice && (
					<ToneOfVoiceSection
						data={data.toneOfVoice}
						cardStyle={cardStyle}
						mutedCardStyle={mutedCardStyle}
					/>
				)}

				<section className="snap-start">
					<div className="mx-auto flex max-w-6xl items-center px-4 py-6">
						<div
							className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] "
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Spacing + Size
								</p>
								<h3 className="text-3xl font-semibold">
									Clear Space and Minimum Size
								</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Maintain a clear space of{" "}
									{logo.spacingAndSize.clearSpace.value}
									{logo.spacingAndSize.clearSpace.unit} around the symbol
									height. Minimum sizes preserve legibility across print and
									digital contexts.
								</p>
							</div>
							<div className="grid gap-4">
								<div className="border p-4" style={mutedCardStyle}>
									<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
										<div className="flex flex-col gap-3">
											<div
												className="border border-dashed px-6 py-6 text-center"
												style={cardStyle}
											>
												<div className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
													Clear Space Diagram
												</div>
												<div className="mt-4 flex items-center justify-center">
													<div
														className="relative h-28 w-28 border"
														style={{ borderColor: "var(--border-default)" }}
													>
														<span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-[color:var(--fg-muted)]">
															1x
														</span>
														<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-[color:var(--fg-secondary)]">
															Symbol
														</span>
														<span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-[color:var(--fg-muted)]">
															1x
														</span>
													</div>
												</div>
											</div>
											<p className="text-xs text-[color:var(--fg-muted)]">
												{logo.spacingAndSize.clearSpace.description}
											</p>
										</div>
										<div className="border p-4" style={cardStyle}>
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
												Minimum Size
											</p>
											<div className="mt-3 space-y-2 text-sm text-[color:var(--fg-secondary)]">
												<div className="flex items-center justify-between">
													<span>Print</span>
													<span>
														{logo.spacingAndSize.minimumSize.print.height}
														{logo.spacingAndSize.minimumSize.print.unit}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span>Digital</span>
													<span>
														{logo.spacingAndSize.minimumSize.digital.height}
														{logo.spacingAndSize.minimumSize.digital.unit}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="grid gap-3 md:grid-cols-3">
									{logo.spacingAndSize.recommendedSizes.map((item) => (
										<div
											key={item.name}
											className="border p-4 text-sm"
											style={cardStyle}
										>
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
												{item.name}
											</p>
											<p className="mt-2 text-[color:var(--fg-secondary)]">
												{item.width}x{item.height}px
											</p>
											<p className="mt-1 text-xs text-[color:var(--fg-muted)]">
												{item.useCase}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="snap-start">
					<div className="mx-auto flex max-w-6xl items-center px-4 py-6">
						<div
							className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] "
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Color Palette
								</p>
								<h3 className="text-3xl font-semibold">
									Primary, Secondary, Accent
								</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Each swatch is shown as a display card. Use ratios to balance
									light and dark themes across layouts.
								</p>
							</div>
							<div className="space-y-5">
								<div className="grid gap-4 md:grid-cols-3">
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
											className="border p-4 rounded-lg transition-all hover:shadow-md"
										>
											<div style={cardStyle}>
												<div
													className="h-28 rounded-lg"
													style={{ backgroundColor: swatch.hex }}
												/>
												<div className="mt-3 text-sm text-[color:var(--fg-secondary)]">
													<p className="font-medium text-[color:var(--fg-primary)]">
														{swatch.name}
													</p>
													<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
														{swatch.hex}
													</p>
												</div>
											</div>
										</SectionWrapper>
									))}
								</div>

								<div className="grid gap-5">
									<div className="border p-5" style={mutedCardStyle}>
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
											Scale Preview
										</p>
										<div className="mt-4 grid gap-3 sm:grid-cols-2">
											{Object.entries(color.brand.primary.scale).map(
												([key, value]) => (
													<div
														key={`primary-${key}`}
														className="flex items-center justify-between border px-4 py-3 text-xs"
														style={{
															borderColor: "var(--border-muted)",
															backgroundColor: value,
															color:
																Number(key) > 400
																	? color.darkTheme.foreground.primary
																	: color.lightTheme.foreground.primary,
														}}
													>
														<span>{key}</span>
														<span>{value}</span>
													</div>
												),
											)}
										</div>
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="border p-5" style={cardStyle}>
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
												Light Theme Ratio
											</p>
											<div className="mt-4 grid gap-2">
												{Object.values(color.lightTheme.background).map(
													(value) => (
														<div
															key={`light-${value}`}
															className="h-9 border"
															style={{
																borderColor: "var(--border-default)",
																backgroundColor: value,
															}}
														/>
													),
												)}
											</div>
										</div>
										<div
											className="border p-5"
											style={{
												backgroundColor: "var(--dark-bg-primary)",
												borderColor: "var(--dark-border-default)",
											}}
										>
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dark-fg-secondary)]">
												Dark Theme Ratio
											</p>
											<div className="mt-4 grid gap-2">
												{Object.values(color.darkTheme.background).map(
													(value) => (
														<div
															key={`dark-${value}`}
															className="h-9 border"
															style={{
																borderColor: "var(--dark-border-default)",
																backgroundColor: value,
															}}
														/>
													),
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="snap-start">
					<div className="mx-auto flex max-w-6xl items-center px-4 py-6">
						<div
							className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] "
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Typography
								</p>
								<h3 className="text-3xl font-semibold">Live Copy Preview</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									A direct rendering of type hierarchy and voice. Use the
									samples to check rhythm, weight, and density.
								</p>
							</div>
							<div className="space-y-5">
								<div className="border p-5" style={cardStyle}>
									<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
										Display
									</p>
									<p
										className="mt-4"
										style={{
											fontSize: typography.scale.display.large.fontSize,
											lineHeight: typography.scale.display.large.lineHeight,
											fontWeight: typography.scale.display.large.fontWeight,
										}}
									>
										The way you speak, the way you prototype.
									</p>
								</div>
								<div className="border p-5" style={mutedCardStyle}>
									<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
										Hierarchy
									</p>
									<div className="mt-4 space-y-3">
										<div>
											<p
												style={{
													fontSize: typography.scale.heading.h1.fontSize,
													lineHeight: typography.scale.heading.h1.lineHeight,
													fontWeight: typography.scale.heading.h1.fontWeight,
												}}
											>
												Headline: Brand clarity
											</p>
											<p className="mt-2 text-sm text-[color:var(--fg-secondary)]">
												Subheadline: Principles in motion
											</p>
										</div>
										<p className="text-sm text-[color:var(--fg-secondary)]">
											Body copy: The identity system keeps the experience
											consistent across channels while letting teams move fast.
										</p>
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
											Caption: {brandName} · BI system overview
										</p>
									</div>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									{typography.application.map((item) => (
										<div
											key={item.medium}
											className="border p-5"
											style={cardStyle}
										>
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
												{item.name}
											</p>
											<p className="mt-2 text-sm text-[color:var(--fg-secondary)]">
												{item.description}
											</p>
											<div className="mt-3 text-xs text-[color:var(--fg-muted)]">
												{Object.entries(item.styles)
													.map(([key, value]) => `${key}: ${value}`)
													.join(" · ")}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="snap-start">
					<div className="mx-auto flex min-h-[55vh] max-w-6xl items-center px-4 pb-12">
						<div
							className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] "
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Template Map
								</p>
								<h3 className="text-3xl font-semibold">
									Web Exhibit Structure
								</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Designed for full-page scroll or chapter-based navigation,
									keeping each section focused on a single rule set.
								</p>
							</div>
							<div className="border p-5" style={mutedCardStyle}>
								<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Routes
								</p>
								<ul className="mt-4 space-y-2 text-sm text-[color:var(--fg-secondary)]">
									{[
										"/",
										"/logo",
										"/symbol",
										"/spacing",
										"/colors",
										"/typography",
									].map((route) => (
										<li
											key={route}
											className="border px-4 py-3"
											style={cardStyle}
										>
											{route}
										</li>
									))}
								</ul>
								<p className="mt-6 text-xs text-[color:var(--fg-muted)]">
									Motion: fade + slide only. Focus on clarity over interaction.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* AI Chat */}
			<AIChat
				cardStyle={cardStyle}
				mutedCardStyle={mutedCardStyle}
				onSend={handleAIChat}
			/>

			{/* Property Inspector */}
			<PropertyInspector />
		</main>
	);
}

// Main component with Provider wrapper
export default function BrandGuideClient({ data }: { data: BrandType }) {
	return (
		<BrandEditorProvider initialData={data}>
			<BrandGuideClientInner />
		</BrandEditorProvider>
	);
}
