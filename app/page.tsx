"use client";

import { Avatar } from "@openai/apps-sdk-ui/components/Avatar";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import {
	ArrowRight,
	ArrowUp,
	Chat,
	OpenaiLogoRegular,
	Paperclip,
	Trash,
	User,
	X,
} from "@openai/apps-sdk-ui/components/Icon";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { LoadingDots } from "@openai/apps-sdk-ui/components/Indicator";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { clearLogoImages, storeLogoImages } from "@/lib/logo-storage";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ImageAttachment = {
	id: string;
	name: string;
	dataUrl: string;
};

type MessageAction = {
	type: "generate-guidelines";
	label: string;
	data: {
		logoDataUrl: string;
		logoAnalysis: string;
		marketContext: string;
	};
};

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	images?: ImageAttachment[];
	pending?: boolean;
	action?: MessageAction;
};

type RawData = {
	logoAnalysis?: unknown;
	marketContext?: unknown;
	identity?: unknown;
	guideline?: unknown;
};

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

const getImageInfo = (
	dataUrl: string,
): Promise<{ format: "png" | "jpg" | "svg"; width: number; height: number }> =>
	new Promise((resolve, reject) => {
		const img = new globalThis.Image();
		img.onload = () => {
			const mimeType = dataUrl.split(";")[0].split("/")[1];
			const format = (mimeType === "jpeg" ? "jpg" : mimeType) as
				| "png"
				| "jpg"
				| "svg";
			resolve({ format, width: img.width, height: img.height });
		};
		img.onerror = reject;
		img.src = dataUrl;
	});

const STORAGE_KEY = "chat-messages";

export default function Home() {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const [isComposing, setIsComposing] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSampleQuery, setIsSampleQuery] = useState(false);
	const [rawData, setRawData] = useState<RawData>({});
	const [generationPhase, setGenerationPhase] = useState<string>("");
	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load messages from localStorage on mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setMessages(JSON.parse(stored));
			}
		} catch (error) {
			console.error("Failed to load messages from localStorage:", error);
		}
	}, []);

	// Save messages to localStorage whenever they change
	const saveMessages = useCallback((msgs: ChatMessage[]) => {
		if (typeof window === "undefined") return;
		try {
			// Filter out pending messages before saving
			const toSave = msgs.filter((m) => !m.pending);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch (error) {
			console.error("Failed to save messages to localStorage:", error);
		}
	}, []);

	useEffect(() => {
		saveMessages(messages);
	}, [messages, saveMessages]);

	const clearChat = useCallback(() => {
		setMessages([]);
		localStorage.removeItem(STORAGE_KEY);
		void clearLogoImages();
	}, []);

	const canSend = useMemo(
		() => !isStreaming && (input.trim().length > 0 || attachments.length > 0),
		[attachments.length, input, isStreaming],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: keep the scroll pinned to new messages
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;
		container.scrollTop = container.scrollHeight;
	}, [messages, isStreaming]);

	const handlePickImages = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (files.length === 0) return;

		const next = await Promise.all(
			files.map(async (file) => ({
				id: crypto.randomUUID(),
				name: file.name,
				dataUrl: await readFileAsDataUrl(file),
			})),
		);

		setAttachments((prev) => [...prev, ...next]);
		event.target.value = "";
	};

	const removeAttachment = (id: string) => {
		setAttachments((prev) => prev.filter((item) => item.id !== id));
	};

	const toAgentItems = (items: ChatMessage[]) => {
		const result: Array<Record<string, unknown>> = [];

		for (const message of items) {
			if (message.role === "user") {
				const content: Array<Record<string, unknown>> = [];
				if (message.content.trim()) {
					content.push({ type: "input_text", text: message.content });
				}
				for (const image of message.images ?? []) {
					content.push({
						type: "input_image",
						image: image.dataUrl,
						detail: "auto",
					});
				}
				if (content.length === 0) continue;
				result.push({ role: "user", content });
				continue;
			}

			if (message.role === "assistant" && message.content.trim()) {
				result.push({
					role: "assistant",
					status: "completed",
					content: [{ type: "output_text", text: message.content }],
				});
			}
		}

		return result;
	};

	const sendMessage = async () => {
		if (!canSend) return;

		// Handle sample query - skip API and redirect directly
		if (isSampleQuery) {
			setIsSampleQuery(false);
			const currentAttachments = attachments;
			setInput("");
			setAttachments([]);
			setIsStreaming(true);

			try {
				const response = await fetch("/samples/protopie-output.json");
				const data = await response.json();
				localStorage.setItem("generatedBrandType", JSON.stringify(data));
				if (currentAttachments.length > 0) {
					await storeLogoImages(currentAttachments);
				}
				router.push("/brand");
			} catch (error) {
				console.error("Failed to load sample data:", error);
				setIsStreaming(false);
			}
			return;
		}

		if (attachments.length > 0) {
			void storeLogoImages(attachments);
		}

		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: input.trim(),
			images: attachments,
		};
		const assistantId = crypto.randomUUID();
		const assistantMessage: ChatMessage = {
			id: assistantId,
			role: "assistant",
			content: "",
			pending: true,
		};

		const historyForApi = [...messages, userMessage].filter(
			(message) => !message.pending,
		);

		setMessages((prev) => [...prev, userMessage, assistantMessage]);
		setInput("");
		setAttachments([]);
		setIsStreaming(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: toAgentItems(historyForApi) }),
			});

			if (!response.ok || !response.body) {
				throw new Error("Streaming response not available.");
			}

			// Check if this is a brand analysis response (JSON)
			const isBrandAnalysis =
				response.headers.get("X-Brand-Analysis") === "true";

			if (isBrandAnalysis) {
				const data = await response.json();
				setMessages((prev) =>
					prev.map((message) =>
						message.id === assistantId
							? {
									...message,
									content: data.content,
									action: data.action,
									pending: false,
								}
							: message,
					),
				);
			} else {
				// Normal streaming response
				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				let done = false;
				while (!done) {
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					if (!value) continue;
					const chunk = decoder.decode(value, { stream: true });
					if (!chunk) continue;
					setMessages((prev) =>
						prev.map((message) =>
							message.id === assistantId
								? { ...message, content: message.content + chunk }
								: message,
						),
					);
				}
			}
		} catch (error) {
			console.error("Chat request failed:", error);
			setMessages((prev) =>
				prev.map((message) =>
					message.id === assistantId
						? {
								...message,
								content:
									message.content ||
									"Sorry, something went wrong while streaming the reply.",
							}
						: message,
				),
			);
		} finally {
			setMessages((prev) =>
				prev.map((message) =>
					message.id === assistantId ? { ...message, pending: false } : message,
				),
			);
			setIsStreaming(false);
		}
	};

	const handleGenerateGuidelines = async (action: MessageAction) => {
		if (isGenerating) return;
		setIsGenerating(true);
		setRawData({});
		setGenerationPhase("starting");

		try {
			// Extract image info from logo data URL
			const imageInfo = await getImageInfo(action.data.logoDataUrl);

			// Create UserInput matching the schema
			const userInput = {
				brandName: "Brand",
				industry: "General",
				oneLiner: "브랜드 가이드라인을 위한 로고 분석 기반 생성",
				logoDataUrl: action.data.logoDataUrl,
			};

			// Create LogoAsset matching the schema
			const logoAsset = {
				url: action.data.logoDataUrl,
				format: imageInfo.format,
				width: imageInfo.width,
				height: imageInfo.height,
			};

			const response = await fetch("/api/brand-guideline/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userInput, logoAsset }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("API error details:", errorData);
				throw new Error("Failed to generate guidelines");
			}

			// Read SSE stream to get the final result
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let finalData = null;
			const collectedRawData: RawData = {};
			let buffer = ""; // 불완전한 청크를 버퍼링

			const processLine = (line: string) => {
				if (!line.startsWith("data: ")) return;
				try {
					const eventData = JSON.parse(line.slice(6));
					console.log("[handleGenerateGuidelines] Event:", eventData.type, eventData.agent || "");

					// Handle phase/agent status updates
					if (eventData.type === "phase-start" || eventData.type === "agent-start") {
						setGenerationPhase(eventData.message || eventData.phase || eventData.agent);
					}

					// Handle agent-data events - collect raw data
					if (eventData.type === "agent-data") {
						console.log("[handleGenerateGuidelines] agent-data received:", eventData.agent);
						const agentToField: Record<string, keyof RawData> = {
							vision: "logoAnalysis",
							analysis: "marketContext",
							identity: "identity",
							guideline: "guideline",
						};
						const field = agentToField[eventData.agent];
						if (field) {
							collectedRawData[field] = eventData.data;
							setRawData({ ...collectedRawData });
							console.log("[handleGenerateGuidelines] rawData updated:", Object.keys(collectedRawData));
						}
					}

					// Handle complete event
					if (eventData.type === "complete" && eventData.data) {
						finalData = eventData.data;
					}
				} catch (e) {
					console.warn("[handleGenerateGuidelines] JSON parse error:", e, "line:", line.slice(0, 100));
				}
			};

			if (reader) {
				let done = false;
				while (!done) {
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					if (!value) continue;

					const chunk = decoder.decode(value, { stream: true });
					buffer += chunk;
					const lines = buffer.split("\n");
					// 마지막 라인은 불완전할 수 있으므로 버퍼에 유지
					buffer = lines.pop() || "";

					for (const line of lines) {
						processLine(line);
					}
				}

				// 남은 버퍼 처리
				if (buffer.trim()) {
					processLine(buffer);
				}
			}

			if (finalData) {
				// Strip base64 image data to avoid localStorage quota exceeded error
				const stripBase64 = (data: any): any => {
					if (!data) return data;
					if (typeof data === "string") {
						return data.startsWith("data:") ? "[base64-omitted]" : data;
					}
					if (Array.isArray(data)) {
						return data.map(stripBase64);
					}
					if (typeof data === "object") {
						const result: any = {};
						for (const key of Object.keys(data)) {
							result[key] = stripBase64(data[key]);
						}
						return result;
					}
					return data;
				};

				const dataToStore = stripBase64(finalData);
				const brandType = (dataToStore as { brandType?: unknown }).brandType;

				if (!brandType) {
					throw new Error("BrandType missing from server response.");
				}

				try {
					// Save brandType for /brand page
					localStorage.setItem("generatedBrandType", JSON.stringify(brandType));

					// Save raw models to localStorage
					const rawModels = {
						identity: dataToStore.identity,
						guideline: dataToStore.guideline,
						marketContext: dataToStore.marketContext,
						logoAsset: dataToStore.logoAsset,
						generatedAt: new Date().toISOString(),
					};
					localStorage.setItem("generatedBrandModels", JSON.stringify(rawModels));
				} catch (e) {
					console.error("localStorage quota exceeded:", e);
				}

				router.push("/brand");
			}
		} catch (error) {
			console.error("Failed to generate guidelines:", error);
		} finally {
			setIsGenerating(false);
			setGenerationPhase("");
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey && !isComposing) {
			event.preventDefault();
			sendMessage();
		}
	};

	const handleSampleQuery = async () => {
		try {
			// Fetch the ProtoPie logo from public folder
			const response = await fetch("/samples/protopie-logo.png");
			const blob = await response.blob();
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			});

			// Add logo as attachment
			const logoAttachment: ImageAttachment = {
				id: crypto.randomUUID(),
				name: "protopie-logo.png",
				dataUrl,
			};
			setAttachments([logoAttachment]);
			setIsSampleQuery(true);

			// Set ProtoPie brand identity text
			setInput(`ProtoPie의 브랜드 정체성을 기반으로 BI에서 Product까지 연결되는 브랜드 방향을 제안해줘.

브랜드 정보:
- 브랜드명: ProtoPie
- 설명: 코드 없이 고급 인터랙티브 프로토타입을 만들 수 있는 디자인 도구
- 핵심 가치: 간편함(Simplicity), 강력함(Power), 협업(Collaboration)
- 타겟 사용자: UX/UI 디자이너, 프로덕트 팀
- 브랜드 톤: 현대적이고 전문적이면서도 친근한 느낌`);
		} catch (error) {
			console.error("Failed to load sample query:", error);
			// Fallback to text only
			setInput("BI에서 Product까지 연결되는 브랜드 방향을 제안해줘.");
		}
	};

	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
			{/* Background decorations */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-neutral-300/30 via-neutral-400/20 to-transparent blur-3xl" />
				<div className="absolute -bottom-32 -left-32 h-[400px] w-100 rounded-full bg-gradient-to-tr from-neutral-300/25 via-neutral-200/15 to-transparent blur-3xl" />
				<div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-200/20 to-transparent blur-3xl" />
				{/* Grid pattern overlay */}
				<div
					className="absolute inset-0 opacity-[0.02]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-10">
				{/* Hero Section */}
				<section className="flex flex-col items-center gap-8 text-center">
					{/* Logo and Badge */}
					<div className="motion-fade-up flex flex-col items-center gap-5">
						<div className="flex items-center gap-2">
							<svg
								width="28"
								height="28"
								viewBox="0 0 28 28"
								fill="none"
								role="img"
								aria-label="Brandkit"
							>
								<circle cx="14" cy="14" r="14" fill="#171717" />
							</svg>
							<span className="text-xl font-bold tracking-tight text-neutral-900">
								Brandkit
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
								브랜드 가이드라인 스튜디오
							</span>
							<Badge variant="outline" color="secondary" size="sm">
								BI → Product
							</Badge>
						</div>
					</div>

					{/* Main headline */}
					<div
						className="motion-fade-up max-w-4xl space-y-6"
						style={{ animationDelay: "0.1s" }}
					>
						<h1 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
							로고 하나로 시작하는
							<br />
							<span className="text-neutral-600">브랜드 가이드라인</span>
						</h1>
						<p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-500 sm:text-xl">
							로고를 업로드하고 한 줄 설명만 입력하세요.
							<br className="hidden sm:block" />
							AI가 브랜드 정체성을 분석하고 완성된 가이드라인을 제안합니다.
						</p>
					</div>

					{/* CTA Buttons */}
					<div
						className="motion-fade-up flex flex-wrap items-center justify-center gap-4"
						style={{ animationDelay: "0.2s" }}
					>
						<Button
							color="secondary"
							size="md"
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="bg-neutral-900 text-white shadow-lg shadow-neutral-900/25 transition-all hover:bg-black hover:shadow-xl hover:shadow-neutral-900/30"
						>
							<Paperclip className="size-4" />
							로고 업로드
						</Button>
						<Button
							color="secondary"
							variant="outline"
							size="md"
							type="button"
							onClick={handleSampleQuery}
							className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
						>
							샘플예제로 시작
							<ArrowRight className="size-4" />
						</Button>
					</div>

					{/* Trust indicators */}
					<div
						className="motion-fade-up flex items-center gap-6 text-xs text-neutral-400"
						style={{ animationDelay: "0.3s" }}
					>
						<span className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-neutral-800" />
							실시간 AI 분석
						</span>
						<span className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-neutral-600" />
							JSON 내보내기
						</span>
						<span className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-neutral-400" />
							즉시 편집 가능
						</span>
					</div>
				</section>

				{/* Chat Section */}
				<section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 shadow-2xl shadow-neutral-200/50 backdrop-blur-xl">
					{/* Chat Header */}
					<div className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50/80 to-white/80 px-6 py-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex size-8 items-center justify-center rounded-lg bg-gray-900">
									<Chat className="size-4 text-white" />
								</div>
								<div>
									<h2 className="text-sm font-semibold text-neutral-800">
										브랜드 채팅
									</h2>
									<p className="text-xs text-neutral-400">
										AI 기반 브랜드 분석
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									{isStreaming ? (
										<>
											<LoadingDots className="text-neutral-600" />
											<span className="text-xs text-neutral-600">
												분석 중...
											</span>
										</>
									) : (
										<>
											<span className="size-2 rounded-full bg-neutral-800" />
											<span className="text-xs text-neutral-500">준비됨</span>
										</>
									)}
								</div>
								<Badge size="sm" variant="outline" color="secondary">
									GPT-5.2
								</Badge>
								{messages.length > 0 && (
									<Button
										color="secondary"
										variant="ghost"
										size="xs"
										type="button"
										onClick={clearChat}
										aria-label="채팅 초기화"
									>
										<Trash className="size-4" />
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-6 p-5 sm:p-6">
						<div
							ref={scrollRef}
							className="max-h-[58vh] space-y-4 overflow-y-auto pr-2"
						>
							{messages.length === 0 ? (
								<div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50/50 to-white px-8 py-12 text-center">
									<div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-100">
										<Chat className="size-7 text-neutral-600" />
									</div>
									<div className="max-w-md space-y-2">
										<h3 className="text-lg font-semibold text-neutral-800">
											브랜드 분석을 시작해보세요
										</h3>
										<p className="text-sm leading-relaxed text-neutral-500">
											로고를 업로드하고 브랜드에 대해 질문하세요.
											<br />
											AI가 브랜드 정체성을 분석하고 가이드라인을 제안합니다.
										</p>
									</div>
								</div>
							) : (
								messages.map((message) => {
									const isUser = message.role === "user";

									return (
										<div
											key={message.id}
											className={`flex items-start gap-3 ${
												isUser ? "justify-end" : "justify-start"
											}`}
										>
											{!isUser ? (
												<Avatar
													size={36}
													variant="soft"
													color="secondary"
													Icon={OpenaiLogoRegular}
												/>
											) : null}
											<div
												className={`flex max-w-[75%] flex-col gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm ${
													isUser
														? "border border-default bg-transparent text-default"
														: "border border-default bg-surface text-default"
												}`}
											>
												<div className="text-[11px] uppercase tracking-[0.2em] text-secondary">
													{isUser ? "You" : "Assistant"}
												</div>
												{message.content ? (
													isUser ? (
														<p className="whitespace-pre-wrap leading-6">
															{message.content}
														</p>
													) : (
														<MarkdownRenderer
															content={message.content}
															isInverse={false}
														/>
													)
												) : null}
												{message.pending ? (
													<LoadingDots
														className={
															isUser ? "text-inverse" : "text-secondary"
														}
													/>
												) : null}
												{message.images?.length ? (
													<div className="grid grid-cols-2 gap-3">
														{message.images.map((image) => (
															<div
																key={image.id}
																className={`overflow-hidden rounded-xl border ${
																	isUser
																		? "border-primary-outline"
																		: "border-subtle"
																}`}
															>
																<Image
																	src={image.dataUrl}
																	alt={image.name}
																	className="h-28 w-full object-cover"
																/>
															</div>
														))}
													</div>
												) : null}
												{message.action?.type === "generate-guidelines" ? (
													<div className="mt-2 border-t border-subtle pt-3">
														<Button
															color="primary"
															size="sm"
															type="button"
															onClick={() =>
																handleGenerateGuidelines(message.action!)
															}
															disabled={isGenerating}
														>
															{isGenerating ? (
																<LoadingDots className="text-inverse" />
															) : (
																<>
																	<ArrowRight className="size-4" />
																	{message.action.label}
																</>
															)}
														</Button>
														{isGenerating && (
															<div className="mt-3 space-y-2">
																<p className="text-xs text-secondary">
																	{generationPhase || "생성 중..."}
																</p>
																<div className="max-h-48 overflow-y-auto rounded-lg border border-subtle bg-surface p-2">
																	{Object.keys(rawData).length === 0 ? (
																		<p className="text-xs text-secondary">
																			데이터 수신 대기 중...
																		</p>
																	) : (
																		Object.entries(rawData).map(([key, value]) => (
																			<div key={key} className="mb-2 last:mb-0">
																				<p className="text-[10px] font-semibold uppercase text-secondary">
																					[{key}]
																				</p>
																				<pre className="whitespace-pre-wrap break-all text-[10px] text-default">
																					{JSON.stringify(value, null, 2)}
																				</pre>
																			</div>
																		))
																	)}
																</div>
															</div>
														)}
													</div>
												) : null}
											</div>
											{isUser ? (
												<Avatar
													size={36}
													variant="soft"
													color="primary"
													Icon={User}
												/>
											) : null}
										</div>
									);
								})
							)}
						</div>

						{/* Input Area */}
						<div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
							{/* Attachments preview */}
							{attachments.length > 0 && (
								<div className="flex flex-wrap gap-3">
									{attachments.map((item) => (
										<div
											key={item.id}
											className="group relative h-20 w-24 overflow-hidden rounded-xl border-2 border-neutral-300 bg-white shadow-sm transition-all hover:border-neutral-400"
										>
											<Image
												src={item.dataUrl}
												alt={item.name}
												className="h-full w-full object-cover"
											/>
											<Button
												color="secondary"
												variant="solid"
												size="xs"
												uniform
												className="absolute right-1 top-1 bg-neutral-800 opacity-0 shadow-lg transition hover:bg-black group-hover:opacity-100"
												type="button"
												aria-label="Remove attachment"
												onClick={() => removeAttachment(item.id)}
											>
												<X className="size-3" />
											</Button>
											<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
												<span className="text-[10px] font-medium text-white">
													로고
												</span>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Input row */}
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
								<div className="flex-1">
									<Textarea
										value={input}
										onChange={(event) => setInput(event.target.value)}
										onKeyDown={handleKeyDown}
										onCompositionStart={() => setIsComposing(true)}
										onCompositionEnd={() => setIsComposing(false)}
										placeholder="브랜드에 대해 설명해주세요. 예: 우리는 친환경 라이프스타일 브랜드입니다."
										rows={2}
										autoResize
										className="w-full rounded-xl border-neutral-200 bg-white shadow-sm focus:border-neutral-400 focus:ring-neutral-200"
									/>
								</div>
								<div className="flex shrink-0 gap-2">
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										multiple
										onChange={handlePickImages}
										className="hidden"
									/>
									<Button
										color="secondary"
										variant="outline"
										size="sm"
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="border-neutral-300 hover:bg-neutral-100"
									>
										<Paperclip className="size-4" />
										<span className="hidden sm:inline">로고</span>
									</Button>
									<Button
										color="secondary"
										size="sm"
										type="button"
										onClick={sendMessage}
										disabled={!canSend}
										className="bg-neutral-900 text-white shadow-md shadow-neutral-900/20 hover:bg-black disabled:bg-neutral-300"
									>
										<ArrowUp className="size-4" />
										전송
									</Button>
								</div>
							</div>

							{/* Helper text */}
							<div className="flex items-center justify-between text-[11px] text-neutral-400">
								<span>Shift + Enter로 줄바꿈</span>
								<span>{canSend ? "전송 준비됨" : "메시지를 입력하세요"}</span>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
