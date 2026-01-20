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
	User,
	X,
} from "@openai/apps-sdk-ui/components/Icon";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { LoadingDots } from "@openai/apps-sdk-ui/components/Indicator";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useRouter } from "next/navigation";
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

			if (reader) {
				let done = false;
				while (!done) {
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					if (!value) continue;

					const text = decoder.decode(value, { stream: true });
					const lines = text.split("\n");

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							try {
								const eventData = JSON.parse(line.slice(6));
								if (eventData.phase === "complete" && eventData.data) {
									finalData = eventData.data;
								}
							} catch {
								// Ignore parse errors
							}
						}
					}
				}
			}

			if (finalData) {
				localStorage.setItem("generatedBrandType", JSON.stringify(finalData));
				router.push("/brand");
			}
		} catch (error) {
			console.error("Failed to generate guidelines:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey && !isComposing) {
			event.preventDefault();
			sendMessage();
		}
	};

	return (
		<main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.35),_transparent_65%)] blur-3xl" />
				<div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.25),_transparent_70%)] blur-3xl" />
				<div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.2),_transparent_70%)] blur-3xl" />
			</div>
			<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
				<section className="motion-fade-up flex flex-col gap-6">
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-amber-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/20">
							CW
						</div>
						<div className="space-y-1">
							<div className="flex flex-wrap items-center gap-3">
								<p className="text-xs uppercase tracking-[0.4em] text-secondary">
									Brand Kit Studio
								</p>
								<Badge variant="soft" color="info">
									BI → Product
								</Badge>
							</div>
							<p className="text-sm text-secondary">
								로고와 한 줄 설명만 있으면 브랜드 가이드라인부터 제품 방향까지
								바로 이어집니다.
							</p>
						</div>
					</div>
					<div className="max-w-3xl space-y-4">
						<h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-default sm:text-6xl">
							BI에서 Product까지,
							<br />한 번에 시작하세요.
						</h1>
						<p className="text-lg text-secondary">
							로고 업로드 → 한 줄 쿼리 → 바로 인사이트. 브랜드 정체성을 제품
							경험으로 연결하는 가장 빠른 시작점입니다.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							color="primary"
							size="sm"
							type="button"
							onClick={() => fileInputRef.current?.click()}
						>
							<Paperclip className="size-4" />
							로고 업로드
						</Button>
						<Button
							color="secondary"
							variant="soft"
							size="sm"
							type="button"
							onClick={() =>
								setInput("BI에서 Product까지 연결되는 브랜드 방향을 제안해줘.")
							}
						>
							샘플 쿼리 넣기
						</Button>
					</div>
				</section>

				<section className="rounded-3xl border border-default bg-surface-elevated shadow-xl">
					<div className="flex flex-col gap-6 p-5 sm:p-6">
						<div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-secondary">
							<span>Brand Chat Studio</span>
							<div className="flex items-center gap-2 text-xs text-secondary">
								{isStreaming ? (
									<LoadingDots className="text-secondary" />
								) : null}
								<span>{isStreaming ? "Streaming reply" : "Ready"}</span>
								<Badge size="sm" variant="outline">
									gpt-5.2
								</Badge>
							</div>
						</div>

						<div
							ref={scrollRef}
							className="max-h-[58vh] space-y-4 overflow-y-auto pr-2"
						>
							{messages.length === 0 ? (
								<div className="flex flex-col gap-4 rounded-2xl border border-dashed border-subtle bg-surface px-6 py-8 text-sm text-secondary">
									<div className="flex items-center gap-3 text-default">
										<div className="flex size-10 items-center justify-center rounded-2xl bg-surface-secondary">
											<Chat className="size-5" />
										</div>
										<div className="space-y-1">
											<p className="text-base font-semibold text-default">
												로고와 질문을 올려주세요
											</p>
											<p className="text-sm text-secondary">
												BI의 핵심을 정리하고, 바로 제품 경험으로 이어주는 답을
												받아보세요.
											</p>
										</div>
									</div>
									<div className="flex flex-wrap gap-3">
										<Button
											color="secondary"
											variant="soft"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											type="button"
										>
											<Paperclip className="size-4" />
											로고 첨부
										</Button>
										<Button
											color="secondary"
											variant="outline"
											size="sm"
											type="button"
											onClick={() =>
												setInput(
													"우리 브랜드 BI를 제품 UX로 확장하는 방향을 제안해줘.",
												)
											}
										>
											쿼리 예시 보기
										</Button>
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
														? "bg-primary-solid text-inverse"
														: "border border-default bg-surface text-default"
												}`}
											>
												<div
													className={`text-[11px] uppercase tracking-[0.2em] ${
														isUser ? "text-inverse" : "text-secondary"
													}`}
												>
													{isUser ? "You" : "Assistant"}
												</div>
												{message.content ? (
													<p className="whitespace-pre-wrap leading-6">
														{message.content}
													</p>
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

						<div className="rounded-2xl border border-subtle bg-surface px-4 py-3">
							<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-secondary">
								<span>Shift + Enter for a new line</span>
								<span>
									{canSend ? "Ready to send" : "로고 또는 쿼리를 입력"}
								</span>
							</div>
						</div>

						<div className="rounded-2xl border border-default bg-surface p-4">
							<div className="flex flex-col gap-4">
								{attachments.length > 0 ? (
									<div className="flex flex-wrap gap-3">
										{attachments.map((item) => (
											<div
												key={item.id}
												className="group relative h-20 w-24 overflow-hidden rounded-xl border border-subtle bg-surface-secondary"
											>
												<Image
													src={item.dataUrl}
													alt={item.name}
													className="h-full w-full object-cover"
												/>
												<Button
													color="danger"
													variant="solid"
													size="xs"
													uniform
													className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
													type="button"
													aria-label="Remove attachment"
													onClick={() => removeAttachment(item.id)}
												>
													<X className="size-3" />
												</Button>
											</div>
										))}
									</div>
								) : null}

								<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
									<div className="flex-1">
										<Textarea
											value={input}
											onChange={(event) => setInput(event.target.value)}
											onKeyDown={handleKeyDown}
											onCompositionStart={() => setIsComposing(true)}
											onCompositionEnd={() => setIsComposing(false)}
											placeholder="로고를 업로드하고 브랜드 한 줄 정의를 적어주세요."
											rows={3}
											autoResize
											className="w-full"
										/>
									</div>
									<div className="flex flex-col gap-2 sm:flex-row">
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
											variant="soft"
											size="sm"
											type="button"
											onClick={() => fileInputRef.current?.click()}
										>
											<Paperclip className="size-4" />
											로고 추가
										</Button>
										<Button
											color="primary"
											size="sm"
											type="button"
											onClick={sendMessage}
											disabled={!canSend}
										>
											<ArrowUp className="size-4" />
											Send
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
