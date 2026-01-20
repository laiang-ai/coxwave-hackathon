"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../context/BrandEditorContext";
import { useBrandEditor } from "../context/BrandEditorContext";
import {
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  X,
} from "lucide-react";

export function ChatSidebar() {
  const editor = useBrandEditor();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    editor.aiAssistant.messages,
    editor.aiAssistant.currentStreamContent,
    isExpanded,
  ]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const message = input.trim();
    if (!message || editor.aiAssistant.isStreaming) return;

    // Add user message
    editor.addMessage({
      role: "user",
      content: message,
    });

    setInput("");

    // Start streaming
    editor.setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...editor.aiAssistant.messages.map((m) => ({
              role: m.role,
              content: [
                {
                  type: "input_text",
                  text: m.content,
                },
              ],
            })),
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `브랜드 데이터 수정 요청: ${message}\n\n현재 브랜드 데이터:\n${JSON.stringify(
                    editor.mergedData,
                    null,
                    2
                  )}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullContent = "";

      // Stream the response
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
                fullContent += json.content;
                editor.appendStreamContent(json.content);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Parse AI response for property updates
      const pathMatch = fullContent.match(/path[:\s]+([^\s,]+)/i);
      const valueMatch = fullContent.match(/value[:\s]+([^\s,]+)/i);

      const updates: Array<{ path: string; value: any }> = [];
      if (pathMatch && valueMatch) {
        const path = pathMatch[1];
        const value = valueMatch[1];
        updates.push({ path, value });
        editor.applyUpdate(path, value);
      }

      // Add assistant message
      editor.addMessage({
        role: "assistant",
        content: fullContent,
        metadata: updates.length > 0 ? { updates } : undefined,
      });
    } catch (error) {
      console.error("AI chat error:", error);
      editor.addMessage({
        role: "assistant",
        content: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      editor.setStreaming(false);
    }
  }, [input, editor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-black shadow-xl transition-transform hover:scale-105 active:scale-95 z-50"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300 md:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              AI Brand Assistant
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Auto-Design
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {editor.aiAssistant.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8 opacity-60">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-slate-200/50"></div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Bot className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                How can I help you?
              </p>
              <p className="text-xs text-slate-500 mt-2 max-w-[240px] leading-relaxed mx-auto">
                Ask me to change colors, update fonts, or refine the brand tone.
                I'm here to assist designing.
              </p>
            </div>
          </div>
        )}

        {editor.aiAssistant.messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} index={index} />
        ))}

        {editor.aiAssistant.isStreaming && (
          <StreamingIndicator
            content={editor.aiAssistant.currentStreamContent}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200 focus-within:ring-slate-300 focus-within:bg-white transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to edit brand..."
            disabled={editor.aiAssistant.isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || editor.aiAssistant.isStreaming}
            className="mb-1 mr-1 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-black shadow-sm transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {editor.aiAssistant.isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <p className="text-[10px] text-slate-400 font-medium">
            AI-generated content may be inaccurate. Review changes.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MessageBubble({
  message,
  index,
}: {
  message: ChatMessage;
  index: number;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } motion-fade-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 ${
          isUser ? "bg-white" : "bg-slate-900 text-black"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-slate-500" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isUser
              ? "bg-slate-900 text-black"
              : "bg-white text-slate-800 border border-slate-200"
          }`}
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>

          {message.metadata?.updates && message.metadata.updates.length > 0 && (
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200/20 space-y-1.5">
              {message.metadata.updates.map((update, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs opacity-90 font-medium"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="opacity-70">Updated</span>
                  <code className="rounded bg-black/10 px-1 py-0.5 font-mono">
                    {update.path.split(".").pop()}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

function StreamingIndicator({ content }: { content: string }) {
  return (
    <div className="flex w-full gap-3 motion-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-black border border-slate-200">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
        <p className="text-sm whitespace-pre-wrap break-words text-slate-800 leading-relaxed">
          {content}
          <span className="inline-block w-1 h-4 ml-1 align-middle bg-slate-400 animate-pulse rounded-full" />
        </p>
      </div>
    </div>
  );
}
