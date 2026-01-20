"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import type { BrandType, ThemeColors } from "./types";
import LogoSection from "./LogoSection";

const formatDate = (value: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	text: string;
};

type Overrides = {
	primary?: string;
	secondary?: string;
	accent?: string;
	fontFamily?: string;
};

type TargetOption = "primary" | "secondary" | "accent" | "font";

const hexRegex = /^#([0-9a-f]{6})$/i;

const parseCommand = (input: string) => {
	const trimmed = input.trim();
	if (!trimmed) return null;

	const colorMatch = trimmed.match(
		/(primary|secondary|accent)\s*[:=]\s*(#[0-9a-fA-F]{6})/,
	);
	if (colorMatch) {
		return { type: "color", target: colorMatch[1], value: colorMatch[2] } as const;
	}

	const genericColorMatch = trimmed.match(
		/(컬러|색상)\s*[:=]?\s*(#[0-9a-fA-F]{6})/,
	);
	if (genericColorMatch) {
		return { type: "color", target: "primary", value: genericColorMatch[2] } as const;
	}

	const fontMatch = trimmed.match(/font\s*[:=]\s*(.+)$/i) ??
		trimmed.match(/폰트\s*[:=]\s*(.+)$/i);
	if (fontMatch) {
		return { type: "font", value: fontMatch[1].trim() } as const;
	}

	return { type: "unknown" } as const;
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

export default function BrandGuideClient({ data }: { data: BrandType }) {
	const { brandName, version, createdAt } = data.meta;
	const { logo, color, typography } = data;
	const [overrides, setOverrides] = useState<Overrides>({});
	const [chatInput, setChatInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [target, setTarget] = useState<TargetOption>("primary");

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
		"--brand-font": overrides.fontFamily ?? typography.scale.display.large.fontFamily,
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

	const targetOptions: Array<{ id: TargetOption; label: string; hint: string }> =
		[
			{ id: "primary", label: "Primary", hint: "#2563EB" },
			{ id: "secondary", label: "Secondary", hint: "#64748B" },
			{ id: "accent", label: "Accent", hint: "#F97316" },
			{ id: "font", label: "Font", hint: "Space Grotesk" },
		];

	const activeHint = targetOptions.find((option) => option.id === target)?.hint;
	const chatPlaceholder =
		target === "font"
			? "폰트 이름을 입력하세요"
			: activeHint ?? "#2563EB";

	const resolveHex = (value: string) => {
		const trimmed = value.trim();
		if (hexRegex.test(trimmed)) return trimmed;
		if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
		return null;
	};

	const handleCommand = useCallback(() => {
		const input = chatInput.trim();
		if (!input) return;

		const nextMessages: ChatMessage[] = [
			{ id: crypto.randomUUID(), role: "user", text: input },
		];

		const command = parseCommand(input);
		if (command && command.type !== "unknown") {
			if (command.type === "color") {
				const hex = resolveHex(command.value);
				if (!hex) {
					nextMessages.push({
						id: crypto.randomUUID(),
						role: "assistant",
						text: "HEX는 #RRGGBB 형식으로 입력해줘.",
					});
					setMessages((prev) => [...prev, ...nextMessages]);
					setChatInput("");
					return;
				}

				setOverrides((prev) => ({
					...prev,
					[command.target]: hex,
				}));

				nextMessages.push({
					id: crypto.randomUUID(),
					role: "assistant",
					text: `${command.target} 컬러를 ${hex}로 업데이트했어.`,
				});
			}

			if (command.type === "font") {
				setOverrides((prev) => ({ ...prev, fontFamily: command.value }));
				nextMessages.push({
					id: crypto.randomUUID(),
					role: "assistant",
					text: `타이틀 폰트를 ${command.value}로 변경했어.`,
				});
			}
		} else if (target === "font") {
			setOverrides((prev) => ({ ...prev, fontFamily: input }));
			nextMessages.push({
				id: crypto.randomUUID(),
				role: "assistant",
				text: `타이틀 폰트를 ${input}로 변경했어.`,
			});
		} else {
			const hex = resolveHex(input);
			if (!hex) {
				nextMessages.push({
					id: crypto.randomUUID(),
					role: "assistant",
					text: "HEX는 #RRGGBB 형식으로 입력해줘.",
				});
				setMessages((prev) => [...prev, ...nextMessages]);
				setChatInput("");
				return;
			}

			setOverrides((prev) => ({ ...prev, [target]: hex }));
			nextMessages.push({
				id: crypto.randomUUID(),
				role: "assistant",
				text: `${target} 컬러를 ${hex}로 업데이트했어.`,
			});
		}

		setMessages((prev) => [...prev, ...nextMessages]);
		setChatInput("");
	}, [chatInput, target]);

	const handleExport = useCallback(() => {
		if (typeof window === "undefined") return;
		window.print();
	}, []);

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
					<div className="flex items-center gap-2 border px-4 py-2" style={cardStyle}>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.primary }}
						/>
						<span>Primary</span>
					</div>
					<div className="flex items-center gap-2 border px-4 py-2" style={cardStyle}>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.secondary }}
						/>
						<span>Secondary</span>
					</div>
					<div className="flex items-center gap-2 border px-4 py-2" style={cardStyle}>
						<span
							className="h-2 w-2"
							style={{ backgroundColor: theme.brand.accent }}
						/>
						<span>Accent</span>
					</div>
				</div>
			</header>

			<div className="flex flex-col gap-12">
				<section className="snap-start">
					<div className="mx-auto flex min-h-[65vh] max-w-6xl items-center justify-center px-4 py-8">
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

				<section className="snap-start">
					<div className="mx-auto flex min-h-[65vh] max-w-6xl items-center px-4 py-10">
						<div
							className="motion-fade-up grid w-full gap-8 border p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Spacing + Size
								</p>
								<h3 className="text-3xl font-semibold">Clear Space and Minimum Size</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Maintain a clear space of {logo.spacingAndSize.clearSpace.value}
									{logo.spacingAndSize.clearSpace.unit} around the symbol height. Minimum
									sizes preserve legibility across print and digital contexts.
								</p>
							</div>
							<div className="grid gap-4">
								<div className="border p-4" style={mutedCardStyle}>
									<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
										<div className="flex flex-col gap-3">
											<div className="border border-dashed px-6 py-8 text-center" style={cardStyle}>
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
					<div className="mx-auto flex min-h-[65vh] max-w-6xl items-center px-4 py-10">
						<div
							className="motion-fade-up grid w-full gap-8 border p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Color Palette
								</p>
								<h3 className="text-3xl font-semibold">Primary, Secondary, Accent</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Each swatch is shown as a display card. Use ratios to balance light
									and dark themes across layouts.
								</p>
							</div>
							<div className="space-y-5">
								<div className="grid gap-4 md:grid-cols-3">
									{[
										{ ...color.brand.primary, hex: theme.brand.primary },
										{ ...color.brand.secondary, hex: theme.brand.secondary },
										{ ...color.brand.accent, hex: theme.brand.accent },
									].map((swatch) => (
										<div
											key={swatch.name}
											className="border p-4"
											style={cardStyle}
										>
											<div className="h-28" style={{ backgroundColor: swatch.hex }} />
											<div className="mt-3 text-sm text-[color:var(--fg-secondary)]">
												<p className="font-medium text-[color:var(--fg-primary)]">
													{swatch.name}
												</p>
												<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
													{swatch.hex}
												</p>
											</div>
										</div>
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
												{Object.values(color.lightTheme.background).map((value) => (
													<div
														key={`light-${value}`}
														className="h-9 border"
														style={{
															borderColor: "var(--border-default)",
															backgroundColor: value,
														}}
													/>
												))}
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
												{Object.values(color.darkTheme.background).map((value) => (
													<div
														key={`dark-${value}`}
														className="h-9 border"
														style={{
															borderColor: "var(--dark-border-default)",
															backgroundColor: value,
														}}
													/>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="snap-start">
					<div className="mx-auto flex min-h-[65vh] max-w-6xl items-center px-4 py-10">
						<div
							className="motion-fade-up grid w-full gap-8 border p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Typography
								</p>
								<h3 className="text-3xl font-semibold">Live Copy Preview</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									A direct rendering of type hierarchy and voice. Use the samples to
									check rhythm, weight, and density.
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
											Body copy: The identity system keeps the experience consistent across
											channels while letting teams move fast.
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
							className="motion-fade-up grid w-full gap-8 border p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
							style={cardStyle}
						>
							<div className="space-y-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
									Template Map
								</p>
								<h3 className="text-3xl font-semibold">Web Exhibit Structure</h3>
								<p className="text-sm text-[color:var(--fg-secondary)]">
									Designed for full-page scroll or chapter-based navigation, keeping
									each section focused on a single rule set.
								</p>
							</div>
							<div className="border p-5" style={mutedCardStyle}>
								<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Routes
								</p>
								<ul className="mt-4 space-y-2 text-sm text-[color:var(--fg-secondary)]">
									{["/", "/logo", "/symbol", "/spacing", "/colors", "/typography"].map(
										(route) => (
											<li
												key={route}
												className="border px-4 py-3"
												style={cardStyle}
											>
												{route}
											</li>
										),
									)}
								</ul>
								<p className="mt-6 text-xs text-[color:var(--fg-muted)]">
									Motion: fade + slide only. Focus on clarity over interaction.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
			<div className="no-print fixed bottom-6 left-1/2 z-40 w-[min(92vw,760px)] -translate-x-1/2">
				<div
					className="rounded-2xl border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
					style={cardStyle}
				>
					<div className="flex flex-wrap items-center gap-2">
						{targetOptions.map((option) => {
							const isActive = target === option.id;
							const activeStyle = {
								backgroundColor: "var(--brand-primary)",
								borderColor: "var(--brand-primary)",
								color: color.darkTheme.foreground.primary,
							};

							return (
								<button
									key={option.id}
									type="button"
									className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
									style={isActive ? activeStyle : cardStyle}
									onClick={() => setTarget(option.id)}
								>
									{option.label}
								</button>
							);
						})}
						<span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
							{target === "font" ? "Font" : "Color"}
						</span>
					</div>
					<div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
						<div className="flex items-center gap-2">
							<textarea
								value={chatInput}
								onChange={(event) => setChatInput(event.target.value)}
								placeholder={chatPlaceholder}
								rows={1}
								className="min-h-[44px] w-full resize-none rounded-2xl border px-4 py-3 text-sm"
								style={cardStyle}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.shiftKey) {
										event.preventDefault();
										handleCommand();
									}
								}}
							/>
							<button
								type="button"
								className="rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em]"
								style={cardStyle}
								onClick={handleCommand}
							>
								Apply
							</button>
						</div>
						<div className="max-h-28 space-y-2 overflow-auto rounded-2xl border p-3 text-xs" style={mutedCardStyle}>
							{messages.length === 0 ? (
								<p className="text-[color:var(--fg-muted)]">
									여기에 변경 요청을 입력하세요.
								</p>
							) : (
								messages.slice(-6).map((msg) => (
									<p
										key={msg.id}
										className={
											msg.role === "user"
												? "text-[color:var(--fg-primary)]"
												: "text-[color:var(--fg-secondary)]"
										}
									>
										{msg.role === "user" ? "> " : ""}
										{msg.text}
									</p>
								))
							)}
						</div>
					</div>
				</div>
			</div>

		</main>
	);
}
