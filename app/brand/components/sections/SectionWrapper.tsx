"use client";

import type { CSSProperties, ReactNode } from "react";
import { useBrandEditor } from "../../context/BrandEditorContext";

export interface SectionWrapperProps {
	/**
	 * The JSON path this section represents (e.g., "color.brand.primary")
	 */
	path?: string;
	/**
	 * Whether this section is editable
	 */
	editable?: boolean;
	/**
	 * Children to render
	 */
	children: ReactNode;
	/**
	 * Additional class names
	 */
	className?: string;
	/**
	 * Inline styles
	 */
	style?: CSSProperties;
}

/**
 * SectionWrapper - Wraps sections with click-to-edit functionality
 */
export function SectionWrapper({
	path,
	editable = false,
	children,
	className = "",
	style,
}: SectionWrapperProps) {
	const { openInspector, inspector } = useBrandEditor();

	const handleClick = () => {
		if (editable && path) {
			openInspector(path);
		}
	};

	const isActive = inspector.isOpen && inspector.path === path;

	return (
		<div
			className={`relative ${editable ? "group cursor-pointer" : ""} ${className} ${
				isActive ? "ring-2 ring-[color:var(--brand-primary)] ring-offset-2" : ""
			}`}
			style={style}
			onClick={editable ? handleClick : undefined}
			role={editable ? "button" : undefined}
			tabIndex={editable ? 0 : undefined}
			onKeyDown={
				editable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleClick();
							}
						}
					: undefined
			}
		>
			{children}

			{/* Edit icon overlay */}
			{editable && path && (
				<div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
					<div className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-default)] bg-[color:var(--bg-primary)] px-3 py-1.5 shadow-lg">
						<svg
							className="h-3.5 w-3.5 text-[color:var(--fg-secondary)]"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						<span className="text-xs text-[color:var(--fg-secondary)]">Edit</span>
					</div>
				</div>
			)}
		</div>
	);
}
