"use client";

import { useCallback, useEffect, useState } from "react";
import { useBrandEditor } from "../context/BrandEditorContext";
import { getByPath } from "../lib/jsonPathUtils";

/**
 * PropertyInspector - Side panel for editing brand properties
 */
export function PropertyInspector() {
	const editor = useBrandEditor();
	const { inspector, closeInspector, applyUpdate, isModified } = editor;

	const [localValue, setLocalValue] = useState<any>(inspector.currentValue);

	// Update local value when inspector opens with new path
	useEffect(() => {
		setLocalValue(inspector.currentValue);
	}, [inspector.path, inspector.currentValue]);

	const handleApply = useCallback(() => {
		if (inspector.path) {
			applyUpdate(inspector.path, localValue);
			closeInspector();
		}
	}, [inspector.path, localValue, applyUpdate, closeInspector]);

	const handleCancel = useCallback(() => {
		closeInspector();
	}, [closeInspector]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				handleCancel();
			} else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				handleApply();
			}
		},
		[handleCancel, handleApply],
	);

	if (!inspector.isOpen || !inspector.path) {
		return null;
	}

	const pathParts = inspector.path.split(".");
	const propertyName = pathParts[pathParts.length - 1];
	const isColor =
		typeof localValue === "string" && /^#[0-9a-fA-F]{6}$/i.test(localValue);
	const isNumber = typeof localValue === "number";
	const isBoolean = typeof localValue === "boolean";
	const isString = typeof localValue === "string" && !isColor;

	return (
		<aside className="no-print w-full md:w-[400px] h-full flex flex-col border-l border-[color:var(--border-default)] bg-[color:var(--bg-primary)] shadow-2xl relative z-20 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[color:var(--border-default)] px-6 py-4">
					<div className="flex-1">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
							Edit Property
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-[color:var(--fg-secondary)]">
							{pathParts.map((part, index) => (
								<span key={index} className="flex items-center gap-1">
									<span className="text-[color:var(--fg-primary)]">{part}</span>
									{index < pathParts.length - 1 && (
										<span className="text-[color:var(--fg-muted)]">›</span>
									)}
								</span>
							))}
						</div>
					</div>
					<button
						type="button"
						onClick={handleCancel}
						className="rounded-lg p-2 text-[color:var(--fg-secondary)] hover:bg-[color:var(--bg-secondary)]"
						aria-label="Close"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 space-y-6 overflow-y-auto p-6">
					<div>
						<label
							htmlFor="property-value"
							className="mb-2 block text-sm font-medium text-[color:var(--fg-primary)]"
						>
							{propertyName}
						</label>

						{isColor && (
							<div className="space-y-3">
								<input
									type="color"
									value={localValue}
									onChange={(e) => setLocalValue(e.target.value)}
									className="h-20 w-full cursor-pointer rounded-lg border border-[color:var(--border-default)]"
									onKeyDown={handleKeyDown}
								/>
								<input
									type="text"
									value={localValue}
									onChange={(e) => setLocalValue(e.target.value)}
									placeholder="#000000"
									pattern="^#[0-9a-fA-F]{6}$"
									className="w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm text-[color:var(--fg-primary)] placeholder-[color:var(--fg-muted)] focus:border-[color:var(--brand-primary)] focus:outline-none"
									onKeyDown={handleKeyDown}
								/>
							</div>
						)}

						{isNumber && (
							<input
								id="property-value"
								type="number"
								value={localValue}
								onChange={(e) => setLocalValue(Number(e.target.value))}
								className="w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm text-[color:var(--fg-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none"
								onKeyDown={handleKeyDown}
							/>
						)}

						{isBoolean && (
							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={localValue}
									onChange={(e) => setLocalValue(e.target.checked)}
									className="h-5 w-5 rounded border-[color:var(--border-default)] text-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]"
								/>
								<span className="text-sm text-[color:var(--fg-secondary)]">
									{localValue ? "Enabled" : "Disabled"}
								</span>
							</label>
						)}

						{isString && (
							<textarea
								id="property-value"
								value={localValue}
								onChange={(e) => setLocalValue(e.target.value)}
								rows={4}
								className="w-full resize-none rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm text-[color:var(--fg-primary)] placeholder-[color:var(--fg-muted)] focus:border-[color:var(--brand-primary)] focus:outline-none"
								onKeyDown={handleKeyDown}
							/>
						)}

						{!isColor && !isNumber && !isBoolean && !isString && (
							<div className="rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-secondary)] p-4">
								<p className="text-sm text-[color:var(--fg-muted)]">
									Complex type editing not yet supported
								</p>
								<pre className="mt-2 text-xs text-[color:var(--fg-secondary)]">
									{JSON.stringify(localValue, null, 2)}
								</pre>
							</div>
						)}
					</div>

					{/* Preview */}
					{isColor && (
						<div>
							<p className="mb-2 text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
								Preview
							</p>
							<div
								className="h-24 rounded-lg border border-[color:var(--border-default)]"
								style={{ backgroundColor: localValue }}
							/>
						</div>
					)}

					{/* Status */}
					{isModified(inspector.path) && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
							<p className="text-xs text-amber-800 dark:text-amber-200">
								This property has been modified from its original value.
							</p>
						</div>
					)}

					{/* Keyboard Shortcuts */}
					<div className="rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-secondary)] p-3">
						<p className="mb-2 text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
							Keyboard Shortcuts
						</p>
						<div className="space-y-1 text-xs text-[color:var(--fg-secondary)]">
							<div className="flex items-center justify-between">
								<span>Apply</span>
								<kbd className="rounded border border-[color:var(--border-default)] px-2 py-1 font-mono">
									⌘ Enter
								</kbd>
							</div>
							<div className="flex items-center justify-between">
								<span>Cancel</span>
								<kbd className="rounded border border-[color:var(--border-default)] px-2 py-1 font-mono">
									Esc
								</kbd>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 border-t border-[color:var(--border-default)] px-6 py-4">
					<button
						type="button"
						onClick={handleCancel}
						className="rounded-lg border border-[color:var(--border-default)] px-4 py-2 text-sm text-[color:var(--fg-secondary)] hover:bg-[color:var(--bg-secondary)]"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleApply}
						className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
					>
						Apply
					</button>
				</div>
		</aside>
	);
}
