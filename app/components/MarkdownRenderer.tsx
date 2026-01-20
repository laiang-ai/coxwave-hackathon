"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
	content: string;
	isInverse?: boolean;
};

export function MarkdownRenderer({
	content,
	isInverse = false,
}: MarkdownRendererProps) {
	const textColor = isInverse ? "text-inverse" : "text-default";
	const mutedColor = isInverse ? "text-inverse/70" : "text-secondary";
	const borderColor = isInverse ? "border-inverse/20" : "border-subtle";
	const bgColor = isInverse ? "bg-inverse/10" : "bg-surface-secondary";

	const components: Components = {
		h1: ({ children }) => (
			<h1 className={`mb-3 text-xl font-bold ${textColor}`}>{children}</h1>
		),
		h2: ({ children }) => (
			<h2 className={`mb-2 mt-4 text-lg font-semibold ${textColor}`}>
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3 className={`mb-2 mt-3 text-base font-semibold ${textColor}`}>
				{children}
			</h3>
		),
		h4: ({ children }) => (
			<h4 className={`mb-1 mt-2 text-sm font-semibold ${textColor}`}>
				{children}
			</h4>
		),
		p: ({ children }) => (
			<p className={`mb-2 leading-relaxed ${textColor}`}>{children}</p>
		),
		ul: ({ children }) => (
			<ul className={`mb-3 ml-4 list-disc space-y-1 ${textColor}`}>
				{children}
			</ul>
		),
		ol: ({ children }) => (
			<ol className={`mb-3 ml-4 list-decimal space-y-1 ${textColor}`}>
				{children}
			</ol>
		),
		li: ({ children }) => <li className="leading-relaxed">{children}</li>,
		strong: ({ children }) => (
			<strong className="font-semibold">{children}</strong>
		),
		em: ({ children }) => <em className="italic">{children}</em>,
		blockquote: ({ children }) => (
			<blockquote
				className={`my-3 border-l-4 ${borderColor} pl-4 ${mutedColor} italic`}
			>
				{children}
			</blockquote>
		),
		code: ({ children, className }) => {
			const isInline = !className;
			if (isInline) {
				return (
					<code
						className={`rounded px-1.5 py-0.5 font-mono text-sm ${bgColor} ${textColor}`}
					>
						{children}
					</code>
				);
			}
			return (
				<code
					className={`block overflow-x-auto rounded-lg p-3 font-mono text-sm ${bgColor} ${textColor}`}
				>
					{children}
				</code>
			);
		},
		pre: ({ children }) => (
			<pre className={`my-3 overflow-x-auto rounded-lg ${bgColor}`}>
				{children}
			</pre>
		),
		a: ({ href, children }) => (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={`underline underline-offset-2 hover:opacity-80 ${isInverse ? "text-inverse" : "text-primary"}`}
			>
				{children}
			</a>
		),
		hr: () => <hr className={`my-4 border-t ${borderColor}`} />,
		table: ({ children }) => (
			<div className="my-3 overflow-x-auto">
				<table className={`w-full border-collapse border ${borderColor}`}>
					{children}
				</table>
			</div>
		),
		thead: ({ children }) => <thead className={bgColor}>{children}</thead>,
		tbody: ({ children }) => <tbody>{children}</tbody>,
		tr: ({ children }) => (
			<tr className={`border-b ${borderColor}`}>{children}</tr>
		),
		th: ({ children }) => (
			<th
				className={`border ${borderColor} px-3 py-2 text-left text-sm font-semibold ${textColor}`}
			>
				{children}
			</th>
		),
		td: ({ children }) => (
			<td className={`border ${borderColor} px-3 py-2 text-sm ${textColor}`}>
				{children}
			</td>
		),
	};

	return (
		<div className="markdown-content">
			<ReactMarkdown components={components}>{content}</ReactMarkdown>
		</div>
	);
}
