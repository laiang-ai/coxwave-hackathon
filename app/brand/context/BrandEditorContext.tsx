"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import type { BrandType } from "../types";
import type { UseBrandDataReturn } from "../hooks/useBrandData";
import { useBrandData } from "../hooks/useBrandData";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Section customization settings
export interface SectionCustomization {
	sectionOrder: string[];
	hiddenSections: string[];
}

// Property inspector state
export interface InspectorState {
	isOpen: boolean;
	path: string | null;
	currentValue: any;
}

// AI assistant state
export interface AIAssistantState {
	isOpen: boolean;
	targetPath?: string;
	prompt?: string;
}

// Complete editor state
export interface BrandEditorState extends UseBrandDataReturn {
	// Inspector
	inspector: InspectorState;
	openInspector: (path: string) => void;
	closeInspector: () => void;

	// AI Assistant
	aiAssistant: AIAssistantState;
	openAI: (context?: { targetPath?: string; prompt?: string }) => void;
	closeAI: () => void;

	// Section Customization
	customization: SectionCustomization;
	setCustomization: (value: SectionCustomization | ((prev: SectionCustomization) => SectionCustomization)) => void;
	toggleSectionVisibility: (sectionId: string) => void;
	reorderSections: (newOrder: string[]) => void;
	resetCustomization: () => void;

	// Export/Import
	exportData: (format: "json" | "overrides" | "css" | "tailwind") => void;
	importData: (data: BrandType) => void;
}

const BrandEditorContext = createContext<BrandEditorState | null>(null);

// Default section order (will be populated from registry)
const defaultSectionOrder = [
	"brand-overview",
	"logo-system",
	"color-brand",
	"color-themes",
	"typography",
	"spacing",
	"visual-elements",
	"tone-of-voice",
	"template-map",
];

const defaultCustomization: SectionCustomization = {
	sectionOrder: defaultSectionOrder,
	hiddenSections: [],
};

export interface BrandEditorProviderProps {
	children: ReactNode;
	initialData: BrandType;
}

export function BrandEditorProvider({
	children,
	initialData,
}: BrandEditorProviderProps) {
	// Brand data management
	const brandData = useBrandData(initialData);

	// Inspector state
	const [inspector, setInspector] = useState<InspectorState>({
		isOpen: false,
		path: null,
		currentValue: undefined,
	});

	// AI assistant state
	const [aiAssistant, setAIAssistant] = useState<AIAssistantState>({
		isOpen: false,
	});

	// Section customization
	const [customization, setCustomization] = useLocalStorage<SectionCustomization>(
		"brand-customization",
		defaultCustomization,
	);

	// Inspector actions
	const openInspector = useCallback(
		(path: string) => {
			const value = path.split(".").reduce((obj, key) => obj?.[key], brandData.mergedData as any);
			setInspector({
				isOpen: true,
				path,
				currentValue: value,
			});
		},
		[brandData.mergedData],
	);

	const closeInspector = useCallback(() => {
		setInspector({
			isOpen: false,
			path: null,
			currentValue: undefined,
		});
	}, []);

	// AI assistant actions
	const openAI = useCallback(
		(context?: { targetPath?: string; prompt?: string }) => {
			setAIAssistant({
				isOpen: true,
				...context,
			});
		},
		[],
	);

	const closeAI = useCallback(() => {
		setAIAssistant({
			isOpen: false,
		});
	}, []);

	// Section customization actions
	const toggleSectionVisibility = useCallback(
		(sectionId: string) => {
			setCustomization((prev) => ({
				...prev,
				hiddenSections: prev.hiddenSections.includes(sectionId)
					? prev.hiddenSections.filter((id) => id !== sectionId)
					: [...prev.hiddenSections, sectionId],
			}));
		},
		[setCustomization],
	);

	const reorderSections = useCallback(
		(newOrder: string[]) => {
			setCustomization((prev) => ({
				...prev,
				sectionOrder: newOrder,
			}));
		},
		[setCustomization],
	);

	const resetCustomization = useCallback(() => {
		setCustomization(defaultCustomization);
	}, [setCustomization]);

	// Export/Import actions
	const exportData = useCallback(
		(format: "json" | "overrides" | "css" | "tailwind") => {
			let content: string;
			let filename: string;
			let mimeType: string;

			switch (format) {
				case "json":
					content = JSON.stringify(brandData.mergedData, null, 2);
					filename = `${brandData.mergedData.meta.brandName}-brand.json`;
					mimeType = "application/json";
					break;
				case "overrides":
					content = JSON.stringify(brandData.overrides, null, 2);
					filename = `${brandData.mergedData.meta.brandName}-overrides.json`;
					mimeType = "application/json";
					break;
				case "css":
					// TODO: Implement CSS export
					content = "/* CSS export not yet implemented */";
					filename = `${brandData.mergedData.meta.brandName}-variables.css`;
					mimeType = "text/css";
					break;
				case "tailwind":
					// TODO: Implement Tailwind export
					content = "// Tailwind export not yet implemented";
					filename = `${brandData.mergedData.meta.brandName}-tailwind.config.js`;
					mimeType = "text/javascript";
					break;
			}

			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		},
		[brandData.mergedData, brandData.overrides],
	);

	const importData = useCallback(
		(data: BrandType) => {
			// TODO: Implement import logic
			console.log("Import data:", data);
		},
		[],
	);

	const value: BrandEditorState = {
		...brandData,
		inspector,
		openInspector,
		closeInspector,
		aiAssistant,
		openAI,
		closeAI,
		customization,
		setCustomization,
		toggleSectionVisibility,
		reorderSections,
		resetCustomization,
		exportData,
		importData,
	};

	return (
		<BrandEditorContext.Provider value={value}>
			{children}
		</BrandEditorContext.Provider>
	);
}

/**
 * Hook to access brand editor context
 */
export function useBrandEditor() {
	const context = useContext(BrandEditorContext);
	if (!context) {
		throw new Error("useBrandEditor must be used within BrandEditorProvider");
	}
	return context;
}
