"use client";

import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import {
	ArrowRight,
	Check,
	Paperclip,
	X,
} from "@openai/apps-sdk-ui/components/Icon";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { LoadingDots } from "@openai/apps-sdk-ui/components/Indicator";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToneOption, WorkflowEvent } from "@/lib/brand-guideline";

// ============================================
// Types
// ============================================
type FormStep = 1 | 2 | 3 | 4;

type FormData = {
	// Step 1: Basic Info
	brandName: string;
	industry: string;
	oneLiner: string;
	logoDataUrl: string;

	// Step 2: Keywords & Tone
	keywords: string[];
	toneReference: ToneOption[];
	targetAudience: string;

	// Step 3: Philosophy
	vision: string;
	mission: string;
	prohibitedExpressions: string[];

	// Step 4: Preferences
	colorMood: "vibrant" | "muted" | "bold" | "subtle" | "warm" | "cool" | "";
	typographyStyle: "modern" | "classic" | "playful" | "minimal" | "";
	formalityLevel: "formal" | "professional" | "casual" | "friendly" | "";
};

type RawData = {
	logoAnalysis?: unknown;
	marketContext?: unknown;
	identity?: unknown;
	guideline?: unknown;
};

type GenerationState =
	| { status: "idle" }
	| { status: "generating"; phase: string; message: string; rawData: RawData }
	| { status: "complete"; brandTypeJson: string; rawData: RawData }
	| { status: "error"; error: string };

// ============================================
// Constants
// ============================================
const TONE_OPTIONS: ToneOption[] = [
	"전문적인",
	"친근한",
	"혁신적인",
	"신뢰감있는",
	"세련된",
	"따뜻한",
	"역동적인",
	"차분한",
	"유머러스한",
	"고급스러운",
];

const INDUSTRY_OPTIONS = [
	"테크/IT",
	"금융/핀테크",
	"이커머스/리테일",
	"헬스케어",
	"교육/에듀테크",
	"식음료/F&B",
	"패션/뷰티",
	"미디어/엔터테인먼트",
	"여행/호스피탈리티",
	"부동산/건설",
	"제조업",
	"기타",
];

const readFileAsDataUrl = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

// ============================================
// Component
// ============================================
export default function BrandGuidelinePage() {
	console.log("[Client] BrandGuidelinePage component rendering");
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [currentStep, setCurrentStep] = useState<FormStep>(1);
	const [keywordInput, setKeywordInput] = useState("");
	const [prohibitedInput, setProhibitedInput] = useState("");

	const [formData, setFormData] = useState<FormData>({
		brandName: "",
		industry: "",
		oneLiner: "",
		logoDataUrl: "",
		keywords: [],
		toneReference: [],
		targetAudience: "",
		vision: "",
		mission: "",
		prohibitedExpressions: [],
		colorMood: "",
		typographyStyle: "",
		formalityLevel: "",
	});

	const [generationState, setGenerationState] = useState<GenerationState>({
		status: "idle",
	});

	// ============================================
	// LocalStorage Persistence
	// ============================================
	const FORM_STORAGE_KEY = "brand-guideline-form";
	const STEP_STORAGE_KEY = "brand-guideline-step";

	// Load from localStorage on mount
	useEffect(() => {
		console.log("[Client] useEffect: Component mounted");
		if (typeof window === "undefined") return;
		try {
			const storedForm = localStorage.getItem(FORM_STORAGE_KEY);
			if (storedForm) {
				setFormData(JSON.parse(storedForm));
			}
			const storedStep = localStorage.getItem(STEP_STORAGE_KEY);
			if (storedStep) {
				const step = Number.parseInt(storedStep, 10) as FormStep;
				if (step >= 1 && step <= 4) {
					setCurrentStep(step);
				}
			}
		} catch (error) {
			console.error("Failed to load form data from localStorage:", error);
		}
	}, []);

	// Save formData to localStorage whenever it changes
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
		} catch (error) {
			console.error("Failed to save form data to localStorage:", error);
		}
	}, [formData]);

	// Save currentStep to localStorage whenever it changes
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
		} catch (error) {
			console.error("Failed to save step to localStorage:", error);
		}
	}, [currentStep]);

	// ============================================
	// Handlers
	// ============================================
	const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const dataUrl = await readFileAsDataUrl(file);
		setFormData((prev) => ({ ...prev, logoDataUrl: dataUrl }));
		event.target.value = "";
	};

	const addKeyword = () => {
		const trimmed = keywordInput.trim();
		if (
			trimmed &&
			formData.keywords.length < 5 &&
			!formData.keywords.includes(trimmed)
		) {
			setFormData((prev) => ({
				...prev,
				keywords: [...prev.keywords, trimmed],
			}));
			setKeywordInput("");
		}
	};

	const removeKeyword = (keyword: string) => {
		setFormData((prev) => ({
			...prev,
			keywords: prev.keywords.filter((k) => k !== keyword),
		}));
	};

	const toggleTone = (tone: ToneOption) => {
		setFormData((prev) => {
			const isSelected = prev.toneReference.includes(tone);
			if (isSelected) {
				return {
					...prev,
					toneReference: prev.toneReference.filter((t) => t !== tone),
				};
			}
			if (prev.toneReference.length >= 4) return prev;
			return { ...prev, toneReference: [...prev.toneReference, tone] };
		});
	};

	const addProhibited = () => {
		const trimmed = prohibitedInput.trim();
		if (
			trimmed &&
			formData.prohibitedExpressions.length < 10 &&
			!formData.prohibitedExpressions.includes(trimmed)
		) {
			setFormData((prev) => ({
				...prev,
				prohibitedExpressions: [...prev.prohibitedExpressions, trimmed],
			}));
			setProhibitedInput("");
		}
	};

	const removeProhibited = (expr: string) => {
		setFormData((prev) => ({
			...prev,
			prohibitedExpressions: prev.prohibitedExpressions.filter(
				(e) => e !== expr,
			),
		}));
	};

	// ============================================
	// Validation
	// ============================================
	const canProceedStep1 = useMemo(() => {
		return (
			formData.brandName.trim().length >= 1 &&
			formData.industry.trim().length >= 1 &&
			formData.oneLiner.trim().length >= 10 &&
			formData.logoDataUrl.length > 0
		);
	}, [
		formData.brandName,
		formData.industry,
		formData.oneLiner,
		formData.logoDataUrl,
	]);

	const canProceedStep2 = useMemo(() => {
		return formData.keywords.length >= 3;
	}, [formData.keywords]);

	const canGenerate = useMemo(() => {
		return canProceedStep1 && canProceedStep2;
	}, [canProceedStep1, canProceedStep2]);

	// ============================================
	// Generation
	// ============================================
	const handleGenerate = useCallback(async () => {
		console.log("[Client] handleGenerate called, canGenerate:", canGenerate);
		if (!canGenerate) return;

		setGenerationState({
			status: "generating",
			phase: "starting",
			message: "시작 중...",
			rawData: {},
		});

		try {
			// Create logoAsset from dataUrl
			const logoAsset = {
				url: formData.logoDataUrl,
				format: formData.logoDataUrl.includes("image/png")
					? "png"
					: formData.logoDataUrl.includes("image/svg")
						? "svg"
						: "jpg",
				width: 400,
				height: 400,
			};

			const userInput = {
				brandName: formData.brandName,
				industry: formData.industry,
				oneLiner: formData.oneLiner,
				logoDataUrl: formData.logoDataUrl,
				keywords: formData.keywords,
				targetAudience: formData.targetAudience || undefined,
				toneReference:
					formData.toneReference.length > 0
						? formData.toneReference
						: undefined,
				vision: formData.vision || undefined,
				mission: formData.mission || undefined,
				prohibitedExpressions:
					formData.prohibitedExpressions.length > 0
						? formData.prohibitedExpressions
						: undefined,
				preferences:
					formData.colorMood ||
					formData.typographyStyle ||
					formData.formalityLevel
						? {
								colorMood: formData.colorMood || undefined,
								typographyStyle: formData.typographyStyle || undefined,
								formalityLevel: formData.formalityLevel || undefined,
							}
						: undefined,
			};

			const response = await fetch("/api/brand-guideline/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userInput, logoAsset }),
			});

			if (!response.ok || !response.body) {
				throw new Error("Generation failed");
			}

			console.log("[Client] Fetch response received, status:", response.status);

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = ""; // 불완전한 청크를 버퍼링

			console.log("[Client] Starting to read SSE stream...");

			while (true) {
				const { value, done } = await reader.read();
				console.log(
					"[Client] Read chunk, done:",
					done,
					"value length:",
					value?.length,
				);
				if (done) {
					console.log("[Client] Stream done, buffer length:", buffer.length);
					if (buffer.length > 0) {
						console.log("[Client] Remaining buffer:", buffer.slice(0, 500));
					}
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				console.log("[Client] Chunk preview:", chunk.slice(0, 150));
				buffer += chunk;
				const lines = buffer.split("\n");
				// 마지막 라인은 불완전할 수 있으므로 버퍼에 유지
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						try {
							const event = JSON.parse(data) as WorkflowEvent;
							console.log("[Client] Event type:", event.type);

							if (event.type === "phase-start") {
								setGenerationState((prev) => ({
									status: "generating",
									phase: event.phase,
									message: event.message,
									rawData: prev.status === "generating" ? prev.rawData : {},
								}));
							} else if (event.type === "agent-start") {
								setGenerationState((prev) => ({
									status: "generating",
									phase: event.agent,
									message: event.message,
									rawData: prev.status === "generating" ? prev.rawData : {},
								}));
							} else if (event.type === "agent-data") {
								// Raw data 수신 - agent 이름에 따라 적절한 필드에 저장
								setGenerationState((prev) => {
									if (prev.status !== "generating") return prev;
									const agentToField: Record<string, keyof RawData> = {
										vision: "logoAnalysis",
										analysis: "marketContext",
										identity: "identity",
										guideline: "guideline",
									};
									const field = agentToField[event.agent];
									if (!field) return prev;
									return {
										...prev,
										rawData: {
											...prev.rawData,
											[field]: event.data,
										},
									};
								});
							} else if (event.type === "complete") {
								// Store in localStorage and redirect
								console.log("[Client] Complete event received");
								const brandType = (event.data as Record<string, unknown>)
									.brandType;
								console.log(
									"[Client] brandType:",
									brandType ? "exists" : "missing",
								);

								localStorage.setItem(
									"generatedBrandType",
									JSON.stringify(brandType),
								);

								// Store raw models for future use
								const eventData = event.data as Record<string, unknown>;
								const rawModels = {
									identity: eventData.identity,
									guideline: eventData.guideline,
									marketContext: eventData.marketContext,
									logoAsset: eventData.logoAsset,
									generatedAt: new Date().toISOString(),
								};
								localStorage.setItem(
									"generatedBrandModels",
									JSON.stringify(rawModels),
								);

								setGenerationState((prev) => ({
									status: "complete",
									brandTypeJson: JSON.stringify(brandType),
									rawData: prev.status === "generating" ? prev.rawData : {
										identity: eventData.identity,
										guideline: eventData.guideline,
										marketContext: eventData.marketContext,
									},
								}));

								// 자동 리디렉션 제거 - 사용자가 raw data 확인 후 수동 이동
								console.log("[Client] Complete - raw data displayed");
							} else if (event.type === "error") {
								setGenerationState({ status: "error", error: event.error });
							}
						} catch (parseError) {
							console.warn(
								"[Client] JSON parse error:",
								parseError,
								"Data preview:",
								data.slice(0, 200),
							);
						}
					}
				}
			}

			// 남은 버퍼 처리 - 모든 라인 처리
			console.log(
				"[Client] Processing remaining buffer, length:",
				buffer.length,
			);
			const remainingLines = buffer.split("\n");
			for (const line of remainingLines) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6);
					try {
						const event = JSON.parse(data) as WorkflowEvent;
						console.log("[Client] Buffer event type:", event.type);
						if (event.type === "complete") {
							console.log("[Client] Complete event received (from buffer)");
							const brandType = (event.data as Record<string, unknown>)
								.brandType;
							console.log(
								"[Client] brandType:",
								brandType ? "exists" : "missing",
							);

							localStorage.setItem(
								"generatedBrandType",
								JSON.stringify(brandType),
							);

							// Store raw models for future use
							const eventData = event.data as Record<string, unknown>;
							const rawModels = {
								identity: eventData.identity,
								guideline: eventData.guideline,
								marketContext: eventData.marketContext,
								logoAsset: eventData.logoAsset,
								generatedAt: new Date().toISOString(),
							};
							localStorage.setItem(
								"generatedBrandModels",
								JSON.stringify(rawModels),
							);

							setGenerationState((prev) => ({
								status: "complete",
								brandTypeJson: JSON.stringify(brandType),
								rawData: prev.status === "generating" ? prev.rawData : {
									identity: eventData.identity,
									guideline: eventData.guideline,
									marketContext: eventData.marketContext,
								},
							}));

							// 자동 리디렉션 제거 - 사용자가 raw data 확인 후 수동 이동
							console.log("[Client] Complete - raw data displayed (from buffer)");
						} else if (event.type === "error") {
							setGenerationState({ status: "error", error: event.error });
						}
					} catch (parseError) {
						console.warn(
							"[Client] Buffer parse error:",
							parseError,
							"Data preview:",
							data.slice(0, 200),
						);
					}
				}
			}
		} catch (error) {
			setGenerationState({
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}, [canGenerate, formData, router]);

	// ============================================
	// Render
	// ============================================
	const renderStep1 = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<label className="text-sm font-medium text-default">브랜드명 *</label>
				<Input
					value={formData.brandName}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, brandName: e.target.value }))
					}
					placeholder="예: Brand Kit Studio"
					maxLength={50}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					산업/카테고리 *
				</label>
				<select
					value={formData.industry}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, industry: e.target.value }))
					}
					className="w-full rounded-lg border border-default bg-surface px-4 py-2.5 text-sm text-default focus:border-primary focus:outline-none"
				>
					<option value="">선택하세요</option>
					{INDUSTRY_OPTIONS.map((industry) => (
						<option key={industry} value={industry}>
							{industry}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">한줄 정의 *</label>
				<Textarea
					value={formData.oneLiner}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, oneLiner: e.target.value }))
					}
					placeholder="브랜드를 한 문장으로 설명해주세요. (10-200자)"
					rows={2}
					autoResize
				/>
				<p className="text-xs text-secondary">{formData.oneLiner.length}/200</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					로고 업로드 *
				</label>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/svg+xml"
					onChange={handleLogoUpload}
					className="hidden"
				/>
				{formData.logoDataUrl ? (
					<div className="relative inline-block">
						<Image
							src={formData.logoDataUrl}
							alt="Logo preview"
							className="h-32 w-32 rounded-xl border border-default object-contain"
						/>
						<Button
							color="danger"
							variant="solid"
							size="xs"
							uniform
							className="absolute -right-2 -top-2"
							type="button"
							onClick={() =>
								setFormData((prev) => ({ ...prev, logoDataUrl: "" }))
							}
						>
							<X className="size-3" />
						</Button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-subtle bg-surface-secondary transition hover:border-primary hover:bg-surface"
					>
						<div className="flex flex-col items-center gap-2 text-secondary">
							<Paperclip className="size-6" />
							<span className="text-sm">PNG, JPG, SVG (최대 5MB)</span>
						</div>
					</button>
				)}
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					핵심 키워드 *{" "}
					<span className="text-secondary">({formData.keywords.length}/5)</span>
				</label>
				<div className="flex gap-2">
					<Input
						value={keywordInput}
						onChange={(e) => setKeywordInput(e.target.value)}
						onKeyDown={(e) =>
							e.key === "Enter" && (e.preventDefault(), addKeyword())
						}
						placeholder="키워드 입력 후 Enter"
						disabled={formData.keywords.length >= 5}
					/>
					<Button
						color="secondary"
						variant="soft"
						size="sm"
						type="button"
						onClick={addKeyword}
						disabled={formData.keywords.length >= 5}
					>
						추가
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{formData.keywords.map((keyword) => (
						<Badge key={keyword} color="info" variant="soft" className="gap-1">
							{keyword}
							<button type="button" onClick={() => removeKeyword(keyword)}>
								<X className="size-3" />
							</button>
						</Badge>
					))}
				</div>
				<p className="text-xs text-secondary">3-5개의 키워드를 입력하세요</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					톤 레퍼런스{" "}
					<span className="text-secondary">
						({formData.toneReference.length}/4)
					</span>
				</label>
				<div className="flex flex-wrap gap-2">
					{TONE_OPTIONS.map((tone) => {
						const isSelected = formData.toneReference.includes(tone);
						return (
							<button
								key={tone}
								type="button"
								onClick={() => toggleTone(tone)}
								className={`rounded-full px-4 py-2 text-sm transition ${
									isSelected
										? "bg-primary-solid text-inverse"
										: "border border-default bg-surface text-default hover:border-primary"
								}`}
							>
								{isSelected && <Check className="mr-1 inline size-3" />}
								{tone}
							</button>
						);
					})}
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					타겟 오디언스
				</label>
				<Textarea
					value={formData.targetAudience}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))
					}
					placeholder="예: 20-30대 직장인, 디자인에 관심있는 스타트업 창업자"
					rows={2}
					autoResize
				/>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<label className="text-sm font-medium text-default">비전</label>
				<Textarea
					value={formData.vision}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, vision: e.target.value }))
					}
					placeholder="브랜드가 추구하는 미래상을 적어주세요."
					rows={2}
					autoResize
					maxLength={300}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">미션</label>
				<Textarea
					value={formData.mission}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, mission: e.target.value }))
					}
					placeholder="브랜드의 존재 이유와 목표를 적어주세요."
					rows={2}
					autoResize
					maxLength={300}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					금지 표현{" "}
					<span className="text-secondary">
						({formData.prohibitedExpressions.length}/10)
					</span>
				</label>
				<div className="flex gap-2">
					<Input
						value={prohibitedInput}
						onChange={(e) => setProhibitedInput(e.target.value)}
						onKeyDown={(e) =>
							e.key === "Enter" && (e.preventDefault(), addProhibited())
						}
						placeholder="피하고 싶은 표현 입력 후 Enter"
						disabled={formData.prohibitedExpressions.length >= 10}
					/>
					<Button
						color="secondary"
						variant="soft"
						size="sm"
						type="button"
						onClick={addProhibited}
						disabled={formData.prohibitedExpressions.length >= 10}
					>
						추가
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{formData.prohibitedExpressions.map((expr) => (
						<Badge key={expr} color="danger" variant="soft" className="gap-1">
							{expr}
							<button type="button" onClick={() => removeProhibited(expr)}>
								<X className="size-3" />
							</button>
						</Badge>
					))}
				</div>
			</div>
		</div>
	);

	const renderStep4 = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<label className="text-sm font-medium text-default">컬러 무드</label>
				<div className="grid grid-cols-3 gap-2">
					{(
						["vibrant", "muted", "bold", "subtle", "warm", "cool"] as const
					).map((mood) => (
						<button
							key={mood}
							type="button"
							onClick={() =>
								setFormData((prev) => ({
									...prev,
									colorMood: prev.colorMood === mood ? "" : mood,
								}))
							}
							className={`rounded-lg px-4 py-2.5 text-sm capitalize transition ${
								formData.colorMood === mood
									? "bg-primary-solid text-inverse"
									: "border border-default bg-surface text-default hover:border-primary"
							}`}
						>
							{mood}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					타이포그래피 스타일
				</label>
				<div className="grid grid-cols-4 gap-2">
					{(["modern", "classic", "playful", "minimal"] as const).map(
						(style) => (
							<button
								key={style}
								type="button"
								onClick={() =>
									setFormData((prev) => ({
										...prev,
										typographyStyle:
											prev.typographyStyle === style ? "" : style,
									}))
								}
								className={`rounded-lg px-4 py-2.5 text-sm capitalize transition ${
									formData.typographyStyle === style
										? "bg-primary-solid text-inverse"
										: "border border-default bg-surface text-default hover:border-primary"
								}`}
							>
								{style}
							</button>
						),
					)}
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-default">
					포멀리티 레벨
				</label>
				<div className="grid grid-cols-4 gap-2">
					{(["formal", "professional", "casual", "friendly"] as const).map(
						(level) => (
							<button
								key={level}
								type="button"
								onClick={() =>
									setFormData((prev) => ({
										...prev,
										formalityLevel: prev.formalityLevel === level ? "" : level,
									}))
								}
								className={`rounded-lg px-4 py-2.5 text-sm capitalize transition ${
									formData.formalityLevel === level
										? "bg-primary-solid text-inverse"
										: "border border-default bg-surface text-default hover:border-primary"
								}`}
							>
								{level}
							</button>
						),
					)}
				</div>
			</div>
		</div>
	);

	const renderGenerating = () => (
		<div className="flex flex-col items-center gap-6 py-12">
			<div className="flex size-16 items-center justify-center rounded-full bg-surface-secondary">
				<LoadingDots className="text-secondary" />
			</div>
			<div className="text-center">
				<p className="text-lg font-medium text-default">
					브랜드 가이드라인 생성 중
				</p>
				<p className="mt-2 text-sm text-secondary">
					{generationState.status === "generating" && generationState.message}
				</p>
			</div>
			<div className="flex flex-wrap justify-center gap-2">
				{[
					"vision",
					"analysis",
					"identity",
					"logo-guide",
					"color",
					"typography",
					"tone",
					"visual",
					"copywriting",
					"applications",
				].map((agent) => (
					<Badge
						key={agent}
						size="sm"
						variant={
							generationState.status === "generating" &&
							generationState.phase === agent
								? "solid"
								: "soft"
						}
						color={
							generationState.status === "generating" &&
							generationState.phase === agent
								? "info"
								: "secondary"
						}
					>
						{agent}
					</Badge>
				))}
			</div>
			<Button
				color="secondary"
				variant="soft"
				size="sm"
				className="mt-4"
				onClick={() => router.push("/brand")}
			>
				결과 페이지로 이동 (수동)
			</Button>
		</div>
	);

	if (generationState.status === "generating") {
		return (
			<main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.35),_transparent_65%)] blur-3xl" />
					<div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.25),_transparent_70%)] blur-3xl" />
				</div>
				<div className="relative mx-auto max-w-2xl">
					<div className="rounded-3xl border border-default bg-surface-elevated p-8 shadow-xl">
						{renderGenerating()}
					</div>
				</div>
			</main>
		);
	}

	if (generationState.status === "complete") {
		return (
			<main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.35),_transparent_65%)] blur-3xl" />
					<div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.25),_transparent_70%)] blur-3xl" />
				</div>
				<div className="relative mx-auto max-w-2xl">
					<div className="rounded-3xl border border-default bg-surface-elevated p-8 shadow-xl">
						<div className="flex flex-col items-center gap-6 py-12">
							<div className="flex size-16 items-center justify-center rounded-full bg-success-soft">
								<Check className="size-8 text-success" />
							</div>
							<div className="text-center">
								<p className="text-lg font-medium text-default">
									브랜드 가이드라인 생성 완료!
								</p>
								<p className="mt-2 text-sm text-secondary">
									결과 페이지로 이동합니다...
								</p>
							</div>
							<Button
								color="info"
								size="sm"
								onClick={() => router.push("/brand")}
							>
								결과 페이지로 이동
							</Button>
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (generationState.status === "error") {
		return (
			<main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
				<div className="relative mx-auto max-w-2xl">
					<div className="rounded-3xl border border-default bg-surface-elevated p-8 shadow-xl">
						<div className="text-center">
							<p className="text-lg font-medium text-danger">
								오류가 발생했습니다
							</p>
							<p className="mt-2 text-sm text-secondary">
								{generationState.error}
							</p>
							<Button
								color="info"
								size="sm"
								className="mt-4"
								onClick={() => setGenerationState({ status: "idle" })}
							>
								다시 시도
							</Button>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.35),_transparent_65%)] blur-3xl" />
				<div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.25),_transparent_70%)] blur-3xl" />
				<div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.2),_transparent_70%)] blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-2xl">
				{/* Header */}
				<section className="mb-8 flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-amber-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/20">
							BG
						</div>
						<div>
							<div className="flex items-center gap-2">
								<p className="text-xs uppercase tracking-[0.4em] text-secondary">
									Brand Guideline
								</p>
								<Badge variant="soft" color="info">
									Generator
								</Badge>
							</div>
							<p className="text-sm text-secondary">
								로고와 브랜드 정보만 입력하면 완성된 브랜드 가이드라인을
								생성합니다.
							</p>
						</div>
					</div>
				</section>

				{/* Progress */}
				<div className="mb-8 flex items-center justify-between">
					{[1, 2, 3, 4].map((step) => (
						<div key={step} className="flex items-center">
							<button
								type="button"
								onClick={() => setCurrentStep(step as FormStep)}
								className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition ${
									currentStep === step
										? "bg-primary-solid text-inverse"
										: currentStep > step
											? "bg-success-soft text-success"
											: "border border-default bg-surface text-secondary"
								}`}
							>
								{currentStep > step ? <Check className="size-4" /> : step}
							</button>
							{step < 4 && (
								<div
									className={`h-0.5 w-16 sm:w-24 ${
										currentStep > step ? "bg-success" : "bg-subtle"
									}`}
								/>
							)}
						</div>
					))}
				</div>

				{/* Form */}
				<div className="rounded-3xl border border-default bg-surface-elevated p-6 shadow-xl sm:p-8">
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-default">
							{currentStep === 1 && "기본 정보"}
							{currentStep === 2 && "키워드 & 톤"}
							{currentStep === 3 && "브랜드 철학"}
							{currentStep === 4 && "선호도 설정"}
						</h2>
						<p className="mt-1 text-sm text-secondary">
							{currentStep === 1 && "브랜드의 기본 정보와 로고를 입력하세요."}
							{currentStep === 2 &&
								"브랜드를 대표하는 키워드와 톤을 선택하세요."}
							{currentStep === 3 && "브랜드의 비전과 미션을 정의하세요. (선택)"}
							{currentStep === 4 && "스타일 선호도를 선택하세요. (선택)"}
						</p>
					</div>

					{currentStep === 1 && renderStep1()}
					{currentStep === 2 && renderStep2()}
					{currentStep === 3 && renderStep3()}
					{currentStep === 4 && renderStep4()}

					{/* Navigation */}
					<div className="mt-8 flex items-center justify-between">
						<Button
							color="secondary"
							variant="soft"
							size="sm"
							onClick={() =>
								setCurrentStep((prev) =>
									prev > 1 ? ((prev - 1) as FormStep) : prev,
								)
							}
							disabled={currentStep === 1}
						>
							이전
						</Button>

						{currentStep < 4 ? (
							<Button
								color="info"
								size="sm"
								onClick={() =>
									setCurrentStep((prev) =>
										prev < 4 ? ((prev + 1) as FormStep) : prev,
									)
								}
								disabled={currentStep === 1 && !canProceedStep1}
							>
								다음
								<ArrowRight className="size-4" />
							</Button>
						) : (
							<Button
								color="info"
								size="sm"
								onClick={handleGenerate}
								disabled={!canGenerate}
							>
								가이드라인 생성
								<ArrowRight className="size-4" />
							</Button>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
