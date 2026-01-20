"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrandType, LogoAsset, ThemeColors } from "./types";

type LogoData = BrandType["logo"];

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

type LogoTileProps = {
	id: string;
	label: string;
	asset: LogoAsset;
	tone: "light" | "dark";
	uploads: Record<string, string | undefined>;
	onUpload: (id: string, file: File) => void;
	theme: ThemeColors;
	caption?: string;
};

const LogoTile = ({
	id,
	label,
	asset,
	tone,
	uploads,
	onUpload,
	theme,
	caption,
}: LogoTileProps) => {
	const [hasError, setHasError] = useState(false);
	const src = uploads[id] ?? asset.url;
	const isDark = tone === "dark";

	useEffect(() => {
		setHasError(false);
	}, [src]);

	const frameStyle = isDark
		? {
				backgroundColor: theme.dark.background.primary,
				borderColor: theme.dark.border.default,
				color: theme.dark.foreground.primary,
			}
		: {
				backgroundColor: theme.light.background.primary,
				borderColor: theme.light.border.default,
				color: theme.light.foreground.primary,
			};

	const labelStyle = {
		color: isDark
			? theme.dark.foreground.secondary
			: theme.light.foreground.muted,
	};

	const captionStyle = {
		color: isDark
			? theme.dark.foreground.secondary
			: theme.light.foreground.muted,
	};

	return (
		<figure
			className="flex h-full flex-col items-center justify-center gap-3 border p-4 text-center shadow-[0_25px_60px_rgba(15,23,42,0.08)] min-w-0"
			style={frameStyle}
		>
			<div className="text-xs uppercase tracking-[0.2em]" style={labelStyle}>
				{label}
			</div>
			{hasError ? (
				<div
					className="flex h-36 w-full items-center justify-center border border-dashed text-xs overflow-hidden px-2"
					style={{
						borderColor: theme.light.border.default,
						color: theme.light.foreground.muted,
					}}
				>
					<span className="truncate max-w-full block">{asset.url}</span>
				</div>
			) : (
				<img
					src={src}
					alt={label}
					width={asset.width}
					height={asset.height}
					loading="lazy"
					className="max-h-40 w-auto max-w-full object-contain"
					onError={() => setHasError(true)}
				/>
			)}
			<label
				className="cursor-pointer border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
				style={{
					borderColor: theme.light.border.default,
					color: theme.light.foreground.secondary,
				}}
				htmlFor={`upload-${id}`}
			>
				Upload
				<input
					id={`upload-${id}`}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						onUpload(id, file);
						event.currentTarget.value = "";
					}}
				/>
			</label>
			{caption ? (
				<figcaption className="text-xs" style={captionStyle}>
					{caption}
				</figcaption>
			) : null}
		</figure>
	);
};

export default function LogoSection({
	logo,
	theme,
}: {
	logo: LogoData;
	theme: ThemeColors;
}) {
	const [uploads, setUploads] = useState<Record<string, string>>({});

	const handleUpload = useCallback(async (id: string, file: File) => {
		const dataUrl = await readFileAsDataUrl(file);
		setUploads((prev) => ({ ...prev, [id]: dataUrl }));
	}, []);

	const primaryTiles = useMemo(
		() => [
			{
				id: "horizontal-light",
				label: "Horizontal / Light",
				asset: logo.horizontalLogo.light,
				tone: "light" as const,
			},
			{
				id: "horizontal-dark",
				label: "Horizontal / Dark",
				asset: logo.horizontalLogo.dark,
				tone: "dark" as const,
			},
			{
				id: "vertical-light",
				label: "Vertical / Light",
				asset: logo.verticalLogo.light,
				tone: "light" as const,
			},
			{
				id: "vertical-dark",
				label: "Vertical / Dark",
				asset: logo.verticalLogo.dark,
				tone: "dark" as const,
			},
		],
		[logo.horizontalLogo, logo.verticalLogo],
	);

	const symbolTiles = useMemo(
		() => [
			{
				id: "symbol-main",
				label: "Main Symbol",
				asset: logo.symbols.mainSymbol.light,
				tone: "light" as const,
				caption: "Primary symbol",
			},
			{
				id: "symbol-text",
				label: "Wordmark",
				asset: logo.symbols.textLogo.light,
				tone: "light" as const,
				caption: "Text logo",
			},
			{
				id: "symbol-special",
				label: "Special",
				asset: logo.symbols.specialLogo.light,
				tone: "light" as const,
				caption: "Campaign lockup",
			},
		],
		[logo.symbols],
	);

	return (
		<>
			<div
				className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-2"
				style={{
					backgroundColor: "var(--bg-primary)",
					borderColor: "var(--border-default)",
				}}
			>
				<div className="space-y-6">
					<p
						className="text-xs uppercase tracking-[0.3em]"
						style={{ color: theme.light.foreground.muted }}
					>
						Logo System
					</p>
					<h3
						className="text-3xl font-semibold"
						style={{ color: theme.light.foreground.primary }}
					>
						Primary Logo Variants
					</h3>
					<p
						className="text-base"
						style={{ color: theme.light.foreground.secondary }}
					>
						Horizontal and vertical treatments are presented in light and dark
						contexts. Replace any tile by uploading a new asset.
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{primaryTiles.map((tile) => (
						<LogoTile
							key={tile.id}
							id={tile.id}
							label={tile.label}
							asset={tile.asset}
							tone={tile.tone}
							uploads={uploads}
							onUpload={handleUpload}
							theme={theme}
						/>
					))}
				</div>
			</div>

			<div
				className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-2"
				style={{
					backgroundColor: "var(--bg-primary)",
					borderColor: "var(--border-default)",
				}}
			>
				<div className="space-y-6">
					<p
						className="text-xs uppercase tracking-[0.3em]"
						style={{ color: theme.light.foreground.muted }}
					>
						Symbol + Wordmark
					</p>
					<h3
						className="text-3xl font-semibold"
						style={{ color: theme.light.foreground.primary }}
					>
						Symbol Family and Wordmark Treatments
					</h3>
					<p
						className="text-base"
						style={{ color: theme.light.foreground.secondary }}
					>
						Symbols are designed to scale from favicon size to large format.
						Upload updated artwork to validate spacing and contrast.
					</p>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{symbolTiles.map((tile) => (
							<LogoTile
								key={tile.id}
								id={tile.id}
								label={tile.label}
								asset={tile.asset}
								tone={tile.tone}
								caption={tile.caption}
								uploads={uploads}
								onUpload={handleUpload}
								theme={theme}
							/>
						))}
					</div>
					<div
						className="border p-4"
						style={{
							borderColor: theme.light.border.default,
							backgroundColor: theme.light.background.secondary,
						}}
					>
						<p
							className="text-xs uppercase tracking-[0.2em]"
							style={{ color: theme.light.foreground.muted }}
						>
							Grayscale Contrast Preview
						</p>
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							{logo.symbols.textLogoOnBackground.withLightLogo.map((item) => (
								<div
									key={`light-${item.grayscale}`}
									className="flex items-center justify-between border px-4 py-3 text-xs"
									style={{
										borderColor: theme.light.border.muted,
										backgroundColor: `rgb(${item.grayscale}, ${item.grayscale}, ${item.grayscale})`,
										color:
											item.grayscale > 60
												? theme.light.foreground.primary
												: theme.dark.foreground.primary,
									}}
								>
									<span>Light logo · {item.grayscale}%</span>
									<span>CR {item.contrastRatio}</span>
								</div>
							))}
						</div>
					</div>
					<p
						className="text-xs"
						style={{ color: theme.light.foreground.muted }}
					>
						Uploads are local to this session and do not overwrite stored
						assets.
					</p>
				</div>
			</div>
		</>
	);
}
