"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

interface AIChatProps {
	cardStyle: CSSProperties;
	mutedCardStyle: CSSProperties;
	onSend: (message: string) => Promise<void>;
}

export function AIChat({ cardStyle, mutedCardStyle, onSend }: AIChatProps) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async () => {
		const message = input.trim();
		if (!message || isLoading) return;

		setIsLoading(true);
		try {
			await onSend(message);
			setInput("");
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="no-print fixed bottom-4 left-1/2 z-40 w-[min(94vw,700px)] -translate-x-1/2">
			<div
				className="rounded-xl border p-3 shadow-lg backdrop-blur-sm"
				style={{
					...cardStyle,
					backgroundColor: `${cardStyle.backgroundColor}f5`,
				}}
			>
				<div className="flex items-center gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="AI에게 브랜드 수정 요청 (예: primary 색상을 더 밝게)"
						disabled={isLoading}
						className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-primary)]"
						style={cardStyle}
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={isLoading || !input.trim()}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
						style={{
							backgroundColor: "var(--brand-primary)",
						}}
					>
						{isLoading ? "..." : "전송"}
					</button>
				</div>
			</div>
		</div>
	);
}
