"use client";

import { Avatar } from "@openai/apps-sdk-ui/components/Avatar";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { EmptyMessage } from "@openai/apps-sdk-ui/components/EmptyMessage";
import {
	ArrowUp,
	Chat,
	OpenaiLogoRegular,
	Paperclip,
	User,
	X,
} from "@openai/apps-sdk-ui/components/Icon";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { LoadingDots } from "@openai/apps-sdk-ui/components/Indicator";
import { ShimmerableText } from "@openai/apps-sdk-ui/components/ShimmerText";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type ImageAttachment = {
	id: string;
	name: string;
	dataUrl: string;
};

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	images?: ImageAttachment[];
	pending?: boolean;
};

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

export default function Home() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const [isComposing, setIsComposing] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey && !isComposing) {
			event.preventDefault();
			sendMessage();
		}
	};

	return (
		<main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
				<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-4">
						<div className="flex size-12 items-center justify-center rounded-2xl border border-default bg-surface-elevated">
							<OpenaiLogoRegular className="size-6" />
						</div>
						<div className="space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="heading-lg">Brand Kit</h1>
								<Badge
									color={isStreaming ? "info" : "success"}
									variant="soft"
									pill
								>
									{isStreaming ? "Streaming" : "Ready"}
								</Badge>
							</div>
							<ShimmerableText
								as="p"
								className="text-sm text-secondary"
								shimmer={isStreaming}
							>
								Brand Kit chat studio with image input and streaming replies.
							</ShimmerableText>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-default bg-surface-elevated px-4 py-3 text-sm">
						<span className="text-xs uppercase tracking-[0.2em] text-secondary">
							Status
						</span>
						<div className="flex items-center gap-2 text-secondary">
							{isStreaming ? (
								<>
									<LoadingDots className="text-secondary" />
									<span>Streaming reply</span>
								</>
							) : (
								<span>Idle</span>
							)}
						</div>
						<Badge size="sm" variant="outline">
							gpt-4.1-mini
						</Badge>
					</div>
				</header>

				<section className="rounded-3xl border border-default bg-surface-elevated shadow-xl">
					<div className="flex flex-col gap-6 p-5 sm:p-6">
						<div
							ref={scrollRef}
							className="max-h-[60vh] space-y-4 overflow-y-auto pr-2"
						>
							{messages.length === 0 ? (
								<EmptyMessage>
									<EmptyMessage.Icon>
										<Chat className="size-5" />
									</EmptyMessage.Icon>
									<EmptyMessage.Title>Start a conversation</EmptyMessage.Title>
									<EmptyMessage.Description>
										Attach multiple images or send a text-only prompt. Replies
										stream in real time as the model responds.
									</EmptyMessage.Description>
									<EmptyMessage.ActionRow>
										<Button
											color="secondary"
											variant="soft"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											type="button"
										>
											<Paperclip className="size-4" />
											Add images
										</Button>
									</EmptyMessage.ActionRow>
								</EmptyMessage>
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
								<span>{canSend ? "Ready to send" : "Attach or type"}</span>
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
											placeholder="Ask anything, add an image, press Enter..."
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
											Add image
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
